export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const MAX_PDF_TEXT_CHARS = 8000

export function isImage(file) {
  return !!file && typeof file.type === 'string' && file.type.startsWith('image/')
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

let pdfjsPromise = null
async function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist/build/pdf.mjs')
      const workerMod = await import('pdfjs-dist/build/pdf.worker.mjs?url')
      pdfjs.GlobalWorkerOptions.workerSrc = workerMod.default
      return pdfjs
    })()
  }
  return pdfjsPromise
}

export async function extractPdfText(file) {
  try {
    const pdfjs = await loadPdfjs()
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map(it => ('str' in it ? it.str : '')).join(' ') + '\n'
      if (text.length > MAX_PDF_TEXT_CHARS * 2) break
    }
    const trimmed = text.trim()
    return trimmed.length > 0 ? trimmed.slice(0, MAX_PDF_TEXT_CHARS) : null
  } catch {
    return null
  }
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
