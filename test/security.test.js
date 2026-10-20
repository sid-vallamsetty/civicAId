import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'
import { isRequestOriginAllowed, sniffFileType, verifySessionToken } from '../server/security.js'

function token(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

test('validates signed, scoped, unexpired sessions', () => {
  const secret = 'x'.repeat(32)
  const value = token({ sub: 'user-1', iss: 'civicaid', aud: 'civicaid-api', exp: Math.floor(Date.now() / 1000) + 60 }, secret)
  assert.deepEqual(verifySessionToken(value, secret), { id: 'user-1', roles: [] })
  assert.equal(verifySessionToken(`${value}x`, secret), null)
})

test('rejects expired and wrongly scoped sessions', () => {
  const secret = 'x'.repeat(32)
  assert.equal(verifySessionToken(token({ sub: 'u', iss: 'civicaid', aud: 'wrong', exp: 1 }, secret), secret), null)
})

test('sniffs allowlisted formats and rejects MIME-spoofable active content', () => {
  assert.equal(sniffFileType(Buffer.from('%PDF-1.7\n000000')), 'application/pdf')
  assert.equal(sniffFileType(Buffer.from('<svg onload=x>')), null)
  assert.equal(sniffFileType(Buffer.from('not an image')), null)
})

test('allows safe cookie-authenticated reads without an Origin header', () => {
  const request = { method: 'GET', headers: { cookie: 'civicaid_session=token' } }
  assert.equal(isRequestOriginAllowed(request, 'https://civicaid.example'), true)
})

test('requires the exact configured Origin for unsafe cookie-authenticated requests', () => {
  const base = { method: 'POST', headers: { cookie: 'civicaid_session=token' } }
  assert.equal(isRequestOriginAllowed(base, 'https://civicaid.example'), false)
  assert.equal(isRequestOriginAllowed({ ...base, headers: { ...base.headers, origin: 'https://evil.example' } }, 'https://civicaid.example'), false)
  assert.equal(isRequestOriginAllowed({ ...base, headers: { ...base.headers, origin: 'https://civicaid.example' } }, 'https://civicaid.example'), true)
})

test('does not apply browser-cookie CSRF checks to bearer authentication', () => {
  const request = { method: 'POST', headers: { authorization: 'Bearer token' } }
  assert.equal(isRequestOriginAllowed(request, 'https://civicaid.example'), true)
})
