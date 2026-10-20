import { createHmac, timingSafeEqual } from 'node:crypto'

export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

export function isRequestOriginAllowed(req, allowedOrigin) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true
  if ((req.headers.authorization || '').startsWith('Bearer ')) return true
  if (!req.headers.cookie) return true
  return typeof allowedOrigin === 'string' && allowedOrigin.length > 0 && req.headers.origin === allowedOrigin
}

function base64urlDecode(value) {
  return Buffer.from(value, 'base64url')
}

export function verifySessionToken(token, secret, now = Date.now()) {
  if (!secret || Buffer.byteLength(secret) < 32 || typeof token !== 'string') return null
  const pieces = token.split('.')
  if (pieces.length !== 3) return null
  const [encodedHeader, encodedPayload, encodedSignature] = pieces
  const expected = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest()
  let actual
  try { actual = base64urlDecode(encodedSignature) } catch { return null }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null

  try {
    const header = JSON.parse(base64urlDecode(encodedHeader).toString('utf8'))
    const payload = JSON.parse(base64urlDecode(encodedPayload).toString('utf8'))
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null
    if (typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128) return null
    if (payload.iss !== 'civicaid' || payload.aud !== 'civicaid-api') return null
    if (!Number.isFinite(payload.exp) || payload.exp * 1000 <= now) return null
    return { id: payload.sub, roles: Array.isArray(payload.roles) ? payload.roles : [] }
  } catch {
    return null
  }
}

export function sniffFileType(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 12 || bytes.length > MAX_FILE_BYTES) return null
  if (bytes.subarray(0, 5).toString('ascii') === '%PDF-') return 'application/pdf'
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png'
  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  return null
}

export function stripImageMetadata(bytes, type) {
  if (type === 'image/jpeg') return stripJpegMetadata(bytes)
  if (type === 'image/png') return stripPngMetadata(bytes)
  if (type === 'image/webp') return stripWebpMetadata(bytes)
  return bytes
}

function stripJpegMetadata(bytes) {
  const chunks = [bytes.subarray(0, 2)]
  let offset = 2
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1]
    if (marker === 0xda || marker === 0xd9) {
      chunks.push(bytes.subarray(offset))
      return Buffer.concat(chunks)
    }
    const size = bytes.readUInt16BE(offset + 2)
    if (size < 2 || offset + 2 + size > bytes.length) throw new Error('Malformed JPEG')
    if (!(marker >= 0xe1 && marker <= 0xef) && marker !== 0xfe) {
      chunks.push(bytes.subarray(offset, offset + 2 + size))
    }
    offset += 2 + size
  }
  throw new Error('Malformed JPEG')
}

function stripPngMetadata(bytes) {
  const chunks = [bytes.subarray(0, 8)]
  let offset = 8
  const safeChunks = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS'])
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset)
    const end = offset + 12 + length
    if (end > bytes.length) throw new Error('Malformed PNG')
    const name = bytes.subarray(offset + 4, offset + 8).toString('ascii')
    if (safeChunks.has(name)) chunks.push(bytes.subarray(offset, end))
    offset = end
    if (name === 'IEND') return Buffer.concat(chunks)
  }
  throw new Error('Malformed PNG')
}

function stripWebpMetadata(bytes) {
  const chunks = []
  let offset = 12
  while (offset + 8 <= bytes.length) {
    const name = bytes.subarray(offset, offset + 4).toString('ascii')
    const length = bytes.readUInt32LE(offset + 4)
    const end = offset + 8 + length + (length % 2)
    if (end > bytes.length) throw new Error('Malformed WebP')
    if (!['EXIF', 'XMP ', 'ICCP'].includes(name)) chunks.push(bytes.subarray(offset, end))
    offset = end
  }
  const body = Buffer.concat(chunks)
  const header = Buffer.alloc(12)
  header.write('RIFF', 0)
  header.writeUInt32LE(body.length + 4, 4)
  header.write('WEBP', 8)
  return Buffer.concat([header, body])
}
