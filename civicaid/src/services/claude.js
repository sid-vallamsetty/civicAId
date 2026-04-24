export async function verifyEvidence(challenge, evidenceText) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('Missing VITE_ANTHROPIC_API_KEY in .env')
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a warm, encouraging civic engagement verifier for civicAId.

Challenge: ${challenge.title} (${challenge.description})
Maximum points: ${challenge.points}
User submitted evidence: ${evidenceText}

Decide whether the submitted evidence plausibly describes completing the challenge. Be generous but honest — gibberish, unrelated text, or empty descriptions should not be approved. Award partial points if effort is shown but evidence is thin.

Respond in JSON ONLY (no markdown fences, no commentary):
{
  "approved": true | false,
  "pointsAwarded": number (0 to ${challenge.points}),
  "message": "warm encouraging message under 2 sentences"
}`
      }]
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Claude API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  const text = data.content[0].text.trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : text
  return JSON.parse(jsonText)
}
