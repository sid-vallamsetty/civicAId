import { fileToBase64, extractPdfText, isImage, isPdf } from '../utils/fileUtils.js'

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    approved: { type: 'boolean' },
    reason:   { type: 'string' }
  },
  required: ['approved', 'reason'],
  propertyOrdering: ['approved', 'reason']
}

function getApiKey() {
  const env = import.meta.env
  // Prefer the correctly-named var; fall back to the legacy one so an
  // existing .env keeps working without edits.
  const key = env.VITE_GEMINI_API_KEY || env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'your_key_here') {
    throw new Error('Missing VITE_GEMINI_API_KEY in .env')
  }
  return key
}

export async function verifyEvidence(challenge, text, file) {
  const apiKey = getApiKey()
  const userText = (text || '').trim()

  let promptText =
`You are a strict civic-engagement verifier for civicAId.

Challenge: ${challenge.title}
Description: ${challenge.description}
User text evidence: ${userText || '(none provided)'}
`

  const parts = []

  if (file) {
    if (isImage(file)) {
      const { base64, mediaType } = await fileToBase64(file)
      parts.push({
        inline_data: { mime_type: mediaType, data: base64 }
      })
    } else if (isPdf(file)) {
      const pdfText = await extractPdfText(file)
      if (pdfText) {
        promptText += `\nExtracted PDF text:\n"""\n${pdfText}\n"""\n`
      } else {
        const { base64, mediaType } = await fileToBase64(file)
        parts.push({
          inline_data: { mime_type: mediaType, data: base64 }
        })
      }
    }
  }

  promptText +=
`
Given the challenge and the evidence (text/image/document) above, decide if
the task was actually completed. Be strict: if the evidence is irrelevant,
weak, fabricated-looking, or you are unsure — REJECT.

Reply with the structured JSON object only.`

  parts.unshift({ text: promptText })

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2
    }
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errText = await response.text()
    let detail = errText
    try {
      const parsed = JSON.parse(errText)
      detail = parsed?.error?.message || errText
    } catch {}
    throw new Error(`Gemini API error ${response.status}: ${detail}`)
  }

  const data = await response.json()
  const responseText = extractText(data)
  if (!responseText) {
    throw new Error('Gemini returned an empty response.')
  }

  // responseSchema means we should already be getting clean JSON, but be
  // defensive in case the model emits stray characters.
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText)

  return {
    approved: !!parsed.approved,
    reason: typeof parsed.reason === 'string' ? parsed.reason : ''
  }
}

function extractText(data) {
  const candidate = data?.candidates?.[0]
  if (!candidate) return ''
  const parts = candidate?.content?.parts || []
  return parts
    .map(p => (typeof p?.text === 'string' ? p.text : ''))
    .join('')
    .trim()
}
