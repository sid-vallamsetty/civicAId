import { fileToBase64 } from '../utils/fileUtils.js'

export async function verifyEvidence(challenge, text, file) {
  const encoded = file ? await fileToBase64(file) : null
  const response = await fetch('/api/evidence/verify', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeId: challenge.id,
      text: (text || '').trim(),
      file: encoded ? { type: file.type, base64: encoded.base64 } : null
    })
  })

  let data = null
  try { data = await response.json() } catch {}
  if (!response.ok) {
    const error = new Error(data?.error || 'Evidence verification is temporarily unavailable.')
    error.correlationId = data?.correlationId
    throw error
  }
  return data
}
