import { fileToBase64, extractPdfText, isImage, isPdf } from '../utils/fileUtils.js'

export async function verifyEvidence(challenge, text, file) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('Missing VITE_ANTHROPIC_API_KEY in .env')
  }

  const userText = (text || '').trim()
  let promptText = `You are a strict civic-engagement verifier for civicAId.

Challenge: ${challenge.title}
Description: ${challenge.description}
User text evidence: ${userText || '(none provided)'}
`

  const extraBlocks = []

  if (file) {
    if (isImage(file)) {
      const { base64, mediaType } = await fileToBase64(file)
      extraBlocks.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 }
      })
    } else if (isPdf(file)) {
      const pdfText = await extractPdfText(file)
      if (pdfText) {
        promptText += `\nExtracted PDF text:\n"""\n${pdfText}\n"""\n`
      } else {
        const { base64, mediaType } = await fileToBase64(file)
        extraBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: mediaType, data: base64 }
        })
      }
    }
  }

  promptText += `
Given the challenge and the evidence (text/image/document) above, decide if the task was actually completed. Be strict: if the evidence is irrelevant, weak, fabricated-looking, or you are unsure — REJECT.

Respond with JSON ONLY (no markdown fences, no commentary):
{
  "approved": true | false,
  "reason": "short explanation, under one sentence"
}`

  const content = [{ type: 'text', text: promptText }, ...extraBlocks]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content }]
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Claude API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  const responseText = data.content[0].text.trim()
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText)
  return {
    approved: !!parsed.approved,
    reason: typeof parsed.reason === 'string' ? parsed.reason : ''
  }
}
