# Security Audit and Agent Remediation Instructions

Audit date: 2026-10-20

Scope: tracked application source, configuration, generated assets, Git history, and the locked npm dependency graph. Secret values are intentionally omitted from this document.

## Rules for every remediation agent

1. Never paste, log, commit, or repeat a discovered credential. Refer to it only by file and variable name.
2. Rotate or revoke an exposed credential at its provider before treating removal from Git as sufficient.
3. Do not put server secrets in variables prefixed with `VITE_`; Vite intentionally embeds those values in browser JavaScript.
4. Preserve unrelated working-tree changes. At the time of this audit, generated files under `node_modules/.vite/` were already modified.
5. Make each security fix in a focused commit and run the verification checklist at the end of this document.

## Findings and required changes

### P0 — A live-looking API key is committed in `.mcp.json`

Evidence: `.mcp.json` contains a high-entropy value in `mcpServers.magic.env.API_KEY`. The file is tracked, and the value is present in multiple commits in Git history. Assume it has been copied by anyone who could read the repository.

Agent instructions:

1. Ask the repository owner to revoke/rotate this key in the 21st.dev/Magic provider console immediately. Agents must not attempt to validate the key by sending a request.
2. Remove the secret-bearing `.mcp.json` from version control. Add `.mcp.json` to a correctly encoded `.gitignore` and add a tracked `.mcp.example.json` containing only a non-secret placeholder.
3. Store the replacement key in a user-local MCP configuration or supported secret/environment store. Do not invent `${VARIABLE}` interpolation unless the MCP client documentation confirms that it is supported.
4. After rotation, coordinate a history rewrite with all collaborators (for example, `git filter-repo --path .mcp.json --invert-paths`) and force-push all affected branches and tags. History rewriting is disruptive; do it only with repository-owner approval and a clone/recovery plan.
5. Search all branches and tags again after the rewrite. The acceptance criterion is that neither the old credential nor the secret-bearing file can be found in reachable history.

### P0 — Gemini API calls and authorization decisions run in the browser

Evidence: `src/services/gemini.js` reads `VITE_GEMINI_API_KEY` (and legacy `VITE_ANTHROPIC_API_KEY`) and sends it as `x-goog-api-key` directly to Google. Any real `VITE_*` value is embedded in the shipped bundle and is visible through browser developer tools. `src/App.jsx` also awards points entirely from client state based on the model response, so users can alter points or fabricate approvals locally.

Agent instructions:

1. Create a server-side evidence-verification endpoint. Keep `GEMINI_API_KEY` only in the server's secret manager/environment, without a `VITE_` prefix.
2. Change the browser to send evidence to the application endpoint, never directly to `generativelanguage.googleapis.com`.
3. Require an authenticated user on the endpoint. Enforce authorization, per-user and per-IP rate limits, request timeouts, a maximum body/file size, and a bounded model-output size.
4. Treat challenge IDs, point values, and model output as untrusted. Resolve challenges and point awards on the server, validate the model response against a strict schema, and persist the award atomically on the server. Do not accept a point value or approval supplied by the client.
5. Remove the `VITE_ANTHROPIC_API_KEY` fallback and all documentation telling users to place provider secrets in frontend `.env` files.
6. Restrict the provider key to only the required API/model and production egress/origins where the provider supports restrictions. Add budget and usage alerts.

### P1 — Untrusted civic evidence is sent to a third-party AI service

Evidence: free-form text, images, and PDF content are sent to Gemini. These files can contain faces, addresses, signatures, voter-related information, document metadata, or other sensitive information. The UI does not present a clear disclosure/consent step or retention policy.

Agent instructions:

1. Add a plain-language notice before upload identifying the processor, the data sent, purpose, retention/deletion behavior, and a link to the privacy policy. Obtain explicit consent before the first upload.
2. Minimize data before transmission: strip image metadata, avoid retaining previews unnecessarily, redact obvious identifiers where feasible, and define deletion and log-redaction rules.
3. Do not log raw evidence, base64 content, model prompts, provider responses, or authorization headers.
4. Complete a privacy/legal review before production use, especially for minors, election-related activity, and location-bearing evidence.

### P1 — Model prompt injection can influence approvals

Evidence: user text and extracted PDF text are interpolated into the same instruction string in `src/services/gemini.js`. A document can contain instructions intended to override the verifier. Structured JSON constrains response shape, not the correctness of the approval decision.

Agent instructions:

1. Delimit user content as untrusted data and explicitly instruct the model not to follow instructions found inside evidence.
2. Prefer deterministic checks and human review for meaningful rewards. Do not make the model the sole authorization control.
3. Add adversarial tests containing prompt injection in text, PDF text, and images. Confirm they cannot increase points without independent server-side validation.
4. Record a minimal audit event (user, challenge, decision, model/version, timestamp, and non-sensitive reason code), without storing raw evidence unless policy requires it.

### P1 — The locked npm graph has known vulnerabilities

Evidence: `npm audit` reported 8 vulnerable packages: 5 high, 2 moderate, and 1 low. The direct dependency `vite@5.4.21` is affected, with vulnerable transitive packages including `browserslist`, `nanoid`, `postcss`, `source-map-js`, `esbuild`, `baseline-browser-mapping`, and `@babel/core`. Several issues affect development/build tooling; they still matter on developer machines and CI, particularly when processing untrusted files or exposing the dev server.

Agent instructions:

1. Check the project's supported Node.js version, then upgrade Vite and `@vitejs/plugin-react` to currently supported compatible releases. The audit currently proposes a semver-major Vite upgrade, so review the migration notes instead of using `npm audit fix --force` blindly.
2. Regenerate `package-lock.json` from a clean install, run `npm audit`, and require zero high/critical findings or document a time-bounded exception with exploitability analysis.
3. Run the build and application smoke tests after upgrading. Keep the Vite development server bound to loopback unless remote access is explicitly required.
4. Add automated dependency updates and CI checks (`npm ci`, tests/build, and `npm audit --audit-level=high`).

### P1 — `.gitignore` is malformed and generated dependency/build trees are tracked

Evidence: `.gitignore` is UTF-16 LE with NUL bytes, so Git does not apply its patterns normally. Approximately 2,630 `node_modules` files and 10 `dist` files are tracked. This increases supply-chain review noise, preserves stale generated code, and makes accidental secret publication more likely.

Agent instructions:

1. Rewrite `.gitignore` as UTF-8 text with, at minimum: `node_modules/`, `dist/`, `.env`, `.env.*`, `!.env.example`, `.mcp.json`, logs, and editor/OS artifacts.
2. Untrack generated content without deleting local copies: `git rm -r --cached -- node_modules dist`. Review the exact paths before running this command.
3. Rebuild `dist` only in CI/deployment. If this repository intentionally deploys committed build artifacts, use a separate release branch/artifact workflow and scan the output for secrets before publication.
4. Add a pre-commit/CI secret scanner such as Gitleaks or TruffleHog and scan the full Git history, not just the current tree.

### P2 — File validation trusts browser-provided MIME types

Evidence: `src/utils/fileUtils.js` accepts any `image/*` value or `application/pdf` from `File.type`. That value is client-controlled. PDFs are parsed in the browser, and parse failures cause the raw file to be sent to the provider. The 5 MB limit helps, but does not validate content or protect a future server endpoint.

Agent instructions:

1. Revalidate size and type on the server using file signatures/magic bytes; do not trust extension, `Content-Type`, or `File.type` alone.
2. Allowlist only formats actually decoded and needed (for example JPEG, PNG, WebP, and PDF). Reject SVG and other active formats unless sanitized.
3. Apply PDF page/count and decompression/resource limits in addition to byte size, and process parsers in an isolated, patched worker with timeouts.
4. Make parse failure a safe rejection or explicit alternate-review path; do not silently forward an unparsed document.

### P2 — Provider errors are displayed verbatim

Evidence: `src/services/gemini.js` includes the provider response body in thrown errors, and `src/App.jsx` renders `err.message`. This can reveal provider internals, identifiers, quota details, or operational configuration to users.

Agent instructions:

1. Return a generic error message and correlation ID to the browser.
2. Log a structured, redacted server-side error. Never log request headers, credentials, raw evidence, or full provider bodies by default.
3. Bound displayed model reasons to a safe length and keep React's normal text escaping. Do not introduce `dangerouslySetInnerHTML` for model or evidence text.

### P2 — Browser hardening headers are not defined

Evidence: `index.html` loads Google Fonts from third-party origins, while no Content Security Policy is declared in the repository. Deployment headers may exist elsewhere, but none were available in scope.

Agent instructions:

1. Configure deployment-level headers: a restrictive Content Security Policy, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and clickjacking protection through CSP `frame-ancestors`.
2. Start CSP in report-only mode, inventory required connections, then enforce it. After the server proxy is implemented, the browser should not require direct access to the Gemini API.
3. Prefer self-hosted fonts. If Google Fonts remain, explicitly permit only the necessary style/font origins and assess the privacy impact.

### P3 — Local developer paths disclose a username and make scripts non-portable

Evidence: both Python scripts under `scripts/` contain an absolute source path with a developer username.

Agent instructions:

1. Replace the absolute path with a required CLI argument or a repository-relative fixture.
2. Validate that input and output paths resolve within intended directories before writing files.

## Positive observations

- No `eval`, `new Function`, `dangerouslySetInnerHTML`, or direct HTML injection was found in application source.
- React renders evidence and model messages as text, providing default HTML escaping.
- A 5 MB client-side file limit exists.
- Historical `.env` files found during this audit contained placeholder values rather than confirmed credentials. This does not make frontend `VITE_*` secrets safe.
- No additional active credentials matching the common key patterns used by this audit were found outside generated/vendor content. Automated secret scanning is still required because pattern scans are not exhaustive.

## Verification checklist

Run these checks after remediation and attach the results to the pull request:

```powershell
git status --short
git check-ignore -v .env .env.local .mcp.json node_modules dist
git ls-files node_modules dist .env .env.local .mcp.json
rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!dist/**' "(api[_-]?key|secret|token|password|authorization|bearer|private[_-]?key)" .
npm ci
npm audit --audit-level=high
npm run build
```

Also verify manually that:

- Browser bundles and network requests contain no provider credential.
- Direct calls to the verification endpoint without authentication fail.
- Replayed, oversized, malformed, and MIME-spoofed uploads fail safely.
- Prompt-injection samples cannot authorize an award.
- Points cannot be awarded or changed solely through browser state/devtools.
- User-visible errors reveal no provider response body or sensitive configuration.
