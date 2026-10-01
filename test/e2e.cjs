// Playwright E2E against production (390 px). Run from a folder with playwright installed: node test/e2e.cjs <screenshots-dir>
const { chromium, devices } = require('playwright')
const U = process.env.U || 'https://w08-respaldo.vercel.app'
const OUT = process.argv[2]
const NOMBRE = 'Leticia Prueba Inventada', RFC = 'PRUE800101AB1'
const fallas = [], ok = []
const check = (c, m) => (c ? ok : fallas).push(m)
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, acceptDownloads: true })
  const p = await ctx.newPage()
  const consola = []; p.on('console', m => { if (m.type() === 'error') consola.push(m.text()) })
  const reqs = []; p.on('request', r => reqs.push({ url: r.url(), method: r.method(), body: r.postData() || '' }))
  let n = 0; const shot = async (name) => { await p.waitForTimeout(250); await p.screenshot({ path: `${OUT}/${String(++n).padStart(2, '0')}-${name}.png`, fullPage: true }) }
  const sinScroll = async (pag) => { const w = await p.evaluate(() => document.documentElement.scrollWidth); check(w <= 390, `${pag}: sin scroll horizontal (scrollWidth ${w})`) }

  await p.goto(U); await shot('inicio'); await sinScroll('/')
  check(await p.getByText('nunca te escribe primero').first().isVisible(), 'inicio: la regla se ve')
  await p.getByRole('button', { name: /Vengo de mi banco/ }).click()
  await p.waitForURL(/\/caso\?c=RSP-/); const codigo = new URL(p.url()).searchParams.get('c')
  check(/^RSP-[A-HJ-NP-Z2-9]{6}$/.test(codigo), `código de caso con formato (${codigo})`)
  await shot('caso-amenaza'); await sinScroll('/caso')
  check(await p.locator('.regla').first().isVisible(), 'caso: regla antes del primer clic')
  await p.getByRole('button', { name: 'Sí' }).click(); await shot('caso-amenaza-si')
  check(await p.getByText('911').first().isVisible(), 'amenaza: manda a 911/089')
  await p.getByRole('button', { name: /Ya estoy a salvo/ }).click()
  await shot('caso-categoria')
  await p.getByRole('button', { name: /Le transferí dinero/ }).click()
  await p.getByRole('button', { name: /menos de 1 hora/ }).click(); await shot('caso-urgencia')
  check(await p.getByText('Llama YA').isVisible(), 'urgencia <1h: manda al banco antes del plan')
  check(await p.getByText('Tu plan').count() === 0, 'el plan NO aparece antes de la compuerta')
  await p.getByRole('button', { name: /Ya llamé/ }).click()
  await p.getByText('Tu plan').waitFor(); check(await p.getByText('✓ Hecho').count() === 1, 'fix: "ya llamé" deja el paso de reporte como hecho'); check(await p.locator('header a', { hasText: 'Operador' }).count() === 0, 'persona fix: Operador fuera del menú de la víctima'); check(await p.locator('li.border-2').count() === 1, 'persona fix: un solo paso abierto'); await shot('caso-plan'); await sinScroll('/caso plan')
  await p.fill('#clabe', '646180157000000004')
  check(await p.getByText(/Llegó a: Sistema de Transferencias/).isVisible(), 'CLABE válida → banco STP'); check(await p.getByText(/No es un banco de ventanilla/).isVisible(), 'persona fix: STP explicado en simple')
  await p.fill('#clabe', '646180157000000005'); check(await p.getByText(/no cuadra/).isVisible(), 'CLABE con dígito malo → aviso')
  await p.fill('#clabe', '646180157000000004'); await shot('caso-clabe')
  const antes = reqs.length
  const resp = p.waitForResponse(r => r.url().endsWith('/api/eventos') && r.request().method() === 'POST')
  await p.getByRole('button', { name: 'Ya lo hice' }).first().click()
  const r = await resp; const body = JSON.parse(r.request().postData())
  check(JSON.stringify(Object.keys(body).sort()) === JSON.stringify(['categoria', 'codigo', 'estado', 'paso']), `evento lleva solo 4 campos (${Object.keys(body)})`)
  check(!reqs.slice(antes).some(x => x.body.includes('646180157000000004') || x.url.includes('646180157000000004')), 'la CLABE no salió del teléfono')
  const dl = p.waitForEvent('download'); await p.getByRole('button', { name: /recordatorios/ }).click(); const d = await dl
  check(d.suggestedFilename().endsWith('.ics'), '.ics descargado')

  // persona re-test safety fix: >1 hour path must NOT say the bank was already warned
  const p2 = await ctx.newPage(); await p2.goto(U + '/caso'); await p2.evaluate(() => localStorage.clear())
  await p2.goto(U); await p2.getByRole('button', { name: /Vengo de mi banco/ }).click(); await p2.waitForURL(/caso/)
  await p2.getByRole('button', { name: 'No, sigamos' }).click(); await p2.getByRole('button', { name: /Le transferí dinero/ }).click()
  await p2.getByRole('button', { name: /más de 1 hora/ }).click(); await p2.getByText('Tu plan').waitFor()
  check(await p2.getByText(/Lo primero, hoy: avisa a tu banco/).isVisible() && await p2.getByText(/Ya hiciste lo más urgente/).count() === 0, 'seguridad: ruta >1h no dice "ya avisaste a tu banco"')
  await p2.close()

  // documentos: privacy under interception
  const inicioDocs = reqs.length
  await p.goto(U + '/documentos?k=transferencia'); await shot('documentos-vacio'); await sinScroll('/documentos')
  await p.fill('#nombre', NOMBRE); await p.fill('#monto', '8000'); await p.fill('#quien', 'mi hermano Antonio (inventado)'); await p.fill('#bancoPropio', 'BanCoppel')
  check(await p.getByText(/Llegó a: Sistema/).isVisible(), 'documentos: CLABE prellenada desde el caso')
  await p.getByRole('button', { name: /Ver mi papel/ }).click(); await shot('documentos-denuncia')
  check(await p.locator('pre.hoja').innerText().then(t => t.includes(NOMBRE) && t.includes('$8,000.00')), 'denuncia con nombre y monto')
  await p.getByRole('button', { name: /Texto para tu queja en CONDUSEF/ }).click(); await p.getByRole('button', { name: /Ver mi papel/ }).click()
  await p.goto(U + '/documentos?k=sat'); await p.fill('#nombre', NOMBRE); await p.fill('#rfc', RFC); await p.getByRole('button', { name: /Ver mi papel/ }).click(); await shot('documentos-sat')
  const fuga = reqs.slice(inicioDocs).filter(x => [NOMBRE, encodeURIComponent(NOMBRE), RFC, 'Antonio'].some(v => x.url.includes(v) || x.body.includes(v)))
  check(fuga.length === 0, `documentos: ninguna petición lleva nombre/RFC (${reqs.length - inicioDocs} peticiones revisadas)`)
  const ls = await p.evaluate(() => localStorage.getItem('respaldo.v1') || '')
  check(!ls.includes(NOMBRE), 'documentos: sin la casilla, el nombre no se guarda en el teléfono')

  await p.goto(U + '/es-real'); await p.getByText(/Probar con un ejemplo/).click(); await shot('es-real'); await sinScroll('/es-real')
  check(await p.getByText(/Es un fraude/).isVisible(), 'es-real: ejemplo → fraude')
  await p.goto(U + '/operador'); await p.getByText(/códigos de caso distintos/).waitFor(); await shot('operador'); await sinScroll('/operador')
  await p.goto(U + '/operador/redactar'); await shot('redactar'); await sinScroll('/operador/redactar')
  await p.goto(U + '/reglas'); await shot('reglas'); await sinScroll('/reglas')
  check(consola.filter(c => /Content Security Policy|Refused/.test(c)).length === 0, `sin violaciones CSP en consola (${consola.length} errores totales)`)
  if (consola.length) console.log('CONSOLA:', consola.slice(0, 5))
  console.log('OK', ok.length); ok.forEach(x => console.log('  ✓', x))
  console.log('FALLAS', fallas.length); fallas.forEach(x => console.log('  ✗', x))
  await b.close()
})().catch(e => { console.error('E2E ERROR', e.message); process.exit(1) })
