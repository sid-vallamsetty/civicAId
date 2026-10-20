export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function isImage(file) {
  return !!file && ALLOWED_IMAGE_TYPES.has(file.type)
}

export function isPdf(file) {
  return !!file && file.type === 'application/pdf'
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export async function fileToBase64(file) {
  const dataUrl = await readFileAsDataURL(file)
  const commaIdx = dataUrl.indexOf(',')
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : ''
  return { base64, mediaType: file.type, dataUrl }
}

export function validateFile(file) {
  if (!file) return null
  if (!isImage(file) && !isPdf(file)) {
    return 'Only images and PDFs are supported.'
  }
  if (file.size > MAX_FILE_SIZE) {
    const mb = Math.round(MAX_FILE_SIZE / 1024 / 1024)
    return `File too large (max ${mb}MB).`
  }
  return null
}
