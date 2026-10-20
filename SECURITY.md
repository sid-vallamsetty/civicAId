# Security and deployment

Use Node.js 22 or later. Run the API with `npm run server` and the Vite frontend with
`npm run dev` in a second terminal.

Provider credentials are server-only. Copy `.env.example` into the deployment's secret
manager; never expose a provider key through a variable prefixed with `VITE_`. The API
requires `GEMINI_API_KEY` and a random `SESSION_SIGNING_SECRET` of at least 32 bytes.

The API accepts an HS256 session JWT from the `civicaid_session` HttpOnly, Secure,
SameSite=Strict cookie or an `Authorization: Bearer` header. Tokens must have issuer
`civicaid`, audience `civicaid-api`, a subject, and an expiry. The deployment's identity
system must issue the session; this repository intentionally has no demo login. Set
`APP_ORIGIN` when cookie authentication is used.

Evidence is size- and signature-checked on the server. Image metadata is removed and
PDFs are bounded and parsed before forwarding. Raw evidence is not persisted. A model
recommendation enters a human review queue and awards no points. Only a signed session
with the `reviewer` role can call `POST /api/evidence/:id/decision`; the server resolves
the challenge value and atomically persists the award.

Production hosting must apply the headers in `public/_headers` (or equivalent), use TLS,
and protect the local API behind a reverse proxy. Complete a privacy/legal review and
publish a deployment-specific privacy contact and retention period before accepting
evidence. Restrict the provider key to the required API/model and configure provider
budget and usage alerts.
