# Respaldo — qué hacer después del fraude

**Live:** https://w08-respaldo.vercel.app · Crystal Ball Studio, Week 8 (AI 2041 ch. 7 "Quantum Genocide") · T3 · OPERATOR · Andrés Álvarez Morphy Namnum

An after-fraud coach for Mexico. A fraud victim (day-one user: the sister who sent $8,000 to a mule account after her brother's WhatsApp was hijacked) arrives from her bank's app with a case code. She gets a 7-day plan in the right order, checks the receiving bank of the CLABE in her browser, prints her denuncia and bank claim **without anything leaving her phone**, and saves reminders to **her own** calendar.

**The design rule:** the service never holds what it protects.
- The server accepts exactly `{codigo, categoria, paso, estado}` and adds `fecha`. Any other field gets a 400 response.
- We never write first, so any message "from Respaldo" is a clone (`/es-real`).
- The LLM never reads what the victim types. It only drafts plainer wording of fixed playbook steps for an operator, with guards against dropped or added numbers, and **a human approves** every draft.

| Route | What |
|---|---|
| `/` | arrive "from your bank" (SIMULADO deep link) + the rule |
| `/caso` | threat gate → category buttons → minutes gate → 7-day plan, CLABE check, `.ics` |
| `/documentos` | denuncia / UNE claim / CONDUSEF text, generated in the browser |
| `/es-real` | clone detector by rules, in the browser |
| `/operador` | real step counts, honest queue (viral-Tuesday simulator), conflict tally |
| `/operador/redactar` | LLM drafts (Gemini 2.5 Flash-Lite via AI Gateway) + human approval |
| `/reglas` | what we store, literally |

**Stack:** Next.js 15 · Tailwind 4 · Vercel Blob (step events only) · AI SDK + Vercel AI Gateway · `clabe-validator` (MIT) · CSP and security headers.
**Tests:** `npm test` (9 unit-test groups over `lib/`) · `test/e2e.cjs` (26 Playwright checks against production, including network interception proving the name and RFC never leave the page).
Docs: `docs/PACKET.md`, `docs/CHARTER.md`, `docs/DECISIONS.md`, `docs/PROMPTS.md`. Class project; not affiliated with any bank. All personas and demo data are invented.
