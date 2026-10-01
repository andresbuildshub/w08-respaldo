# Prompts — w08-respaldo

## Implementation prompt (packet → build), 2026-10-01

> Build "Respaldo" from docs/PACKET.md and docs/CHARTER.md. Next.js 15 App Router (JS) + Tailwind 4, Spanish UI, phone-first (390 px, no horizontal scroll). Small testable features, one commit each:
>
> 1. **lib/** (pure, unit-tested with `node --test`): `playbook.js` (4 categories, static steps {id, dia, titulo, porque, fuente, accion?}), `pii.js` (`detectarPII`: CURP, RFC, CLABE, card 16, phone 10), `clabe.js` (wrap `clabe-validator`: `revisarCLABE` → {ok, banco, mensaje}), `clon.js` (`esClon(texto)` → {veredicto, razones[]} by rules: writes first / asks code / NIP / card / transfer / install / link / urgency), `cola.js` (`colaHonesta({pendientes, humanos, minutosPorCaso, nuevosPorDia, horasPorHumano})` → días hábiles min/max + semanas), `ics.js` (VCALENDAR with N VEVENTs, no personal data), `eventos.js` (`validarEvento` — exactly {codigo, categoria, paso, estado}; regex code; enums), `documentos.js` (denuncia + reclamación + queja CONDUSEF text from a form object; pure strings).
>    *Acceptance:* the packet's test plan a–f passes.
> 2. **Layout + rule box + security headers** (CSP, no-referrer, DENY, Permissions-Policy). *Acceptance:* the rule box shows on `/` and `/caso`; `curl -I` shows the headers.
> 3. **`/` home**: SIMULADO "vengo de mi banco" → generates a demo code client-side; `?c=RSP-XXXXXX` accepted.
> 4. **`/caso`**: emergency gate → category buttons → (transfer) "¿hace cuánto?" gate → plan with checkboxes (localStorage) + CLABE checker inline + .ics button + link to documents; each check → POST `/api/eventos`. *Acceptance:* buttons only, no free text box except the CLABE (browser-only).
> 5. **`/api/eventos`**: POST validates and stores in Vercel Blob (`eventos/<categoria>/<paso>/<fecha>/<rand>.json`); GET returns counts by category/step and distinct codes. *Acceptance:* extra field → 400; stored JSON has 5 keys.
> 6. **`/documentos`**: form (name, RFC optional, dates, amount, CLABE, bank) → printable denuncia / reclamación / CONDUSEF; nothing fetched. PII never posted. *Acceptance:* Playwright intercepts all requests while typing + generating; none contains the typed values.
> 7. **`/es-real`**: paste a message → `esClon` in the browser. 
> 8. **`/operador`**: real counts from GET `/api/eventos`; honest-queue simulator (preset "martes viral" 300/2/30/15); conflict tally (SIMULADO seed + real count of the `rechazo-banco` step); what the bot never handles.
> 9. **`/operador/redactar` + `/api/redactar`**: input = `pasoId` only; prompt built from the catalog; AI Gateway model; if it fails → labeled SIMULADO draft; UI requires "Aprobar / Rechazar" and shows that nothing is published automatically.
> 10. **`/reglas`**: what we store (the literal JSON), what we never do, sources.
>
> Commit plan: lib+tests → layout/home → caso → api → documentos → es-real → operador → redactar → reglas → fixes. Deploy after caso and after operador at minimum.
