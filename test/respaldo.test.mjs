import test from 'node:test'
import assert from 'node:assert/strict'
import { revisarCLABE, detectarPII, esClon } from '../lib/seguridad.js'
import { colaHonesta, esperaDe, validarEvento, registro, generarCodigo, CODIGO_RE, ics } from '../lib/operacion.js'
import { CATEGORIAS, PASOS_VALIDOS } from '../lib/playbook.js'
import { generarDocumento } from '../lib/documentos.js'

test('a) CLABE: valid → bank; bad check digit; letters; wrong length', () => {
  const ok = revisarCLABE('646180157000000004')
  assert.equal(ok.ok, true)
  assert.match(ok.banco, /STP/)
  assert.equal(revisarCLABE('646180157000000005').ok, false)
  assert.match(revisarCLABE('646180157000000005').mensaje, /verificador/)
  assert.equal(revisarCLABE('64618015700000000A').ok, false)
  assert.match(revisarCLABE('64618015700000000').mensaje, /17/)
  assert.equal(revisarCLABE('6461 8015 7000 0000 04').ok, true) // spaces tolerated
})

test('b) PII: catches CURP, RFC, CLABE, card, phone, email; not amounts', () => {
  assert.deepEqual(detectarPII('mi curp es GOMA850101HDFRRN09'), ['CURP'])
  assert.ok(detectarPII('RFC GOMA850101AB1').includes('RFC'))
  assert.ok(detectarPII('cuenta 646180157000000004').includes('CLABE'))
  assert.ok(detectarPII('tarjeta 4152 3133 0000 1234').includes('número de tarjeta'))
  assert.ok(detectarPII('llámame al 55 1234 5678').includes('teléfono'))
  assert.ok(detectarPII('escribe a lety@example.com').includes('correo'))
  assert.deepEqual(detectarPII('le transferí 8,000 el martes'), [])
})

test('c) clone detector', () => {
  const r = esClon('Hola, soy de Respaldo. Para recuperar tu dinero dame el código que te llegó por SMS')
  assert.equal(r.veredicto, 'fraude')
  assert.equal(esClon('Somos del área de fraudes, instala AnyDesk para ayudarte').veredicto, 'fraude')
  assert.equal(esClon('Te escribimos de Respaldo para darle seguimiento a tu caso').veredicto, 'fraude') // writes first
  assert.equal(esClon('Te escribimos de Respaldo', { tuEscribistePrimero: true }).veredicto, 'sin_senales')
  assert.equal(esClon('Urgente, entra aquí: bit.ly/xyz').veredicto, 'sospechoso')
  assert.equal(esClon('Nos vemos el domingo en casa de mi mamá').veredicto, 'sin_senales')
})

test('d) honest queue: viral Tuesday is weeks, not "9 días"', () => {
  const q = colaHonesta({ llegadasHoy: 300, humanos: 2, minutosPorCaso: 30, nuevosPorDia: 15 })
  assert.equal(q.capacidad, 24)
  assert.equal(q.rezago, 276)
  assert.equal(q.neto, 9)
  assert.ok(q.diasMin >= 25 && q.diasMax <= 40, `${q.diasMin}-${q.diasMax}`)
  assert.ok(q.semanasMin >= 5)
  const p200 = esperaDe(200, q)
  assert.equal(p200.hoy, false)
  assert.ok(p200.diasMin > 9)
  assert.equal(esperaDe(10, q).hoy, true)
  assert.equal(colaHonesta({ llegadasHoy: 300, humanos: 1, minutosPorCaso: 30, nuevosPorDia: 15 }).crece, true)
})

test('e) .ics: two events, no personal data', () => {
  const s = ics({ codigo: 'RSP-ABCDEF', categoria: 'transferencia', base: new Date('2026-10-01T12:00:00Z') })
  assert.match(s, /^BEGIN:VCALENDAR/)
  assert.equal((s.match(/BEGIN:VEVENT/g) || []).length, 2)
  assert.match(s, /DTSTART;VALUE=DATE:20261008/)
  assert.match(s, /\r\n/)
  assert.deepEqual(detectarPII(s), [])
})

test('f) API contract: only 4 fields in, 5 stored', () => {
  const base = { codigo: 'RSP-ABCDEF', categoria: 'transferencia', paso: 't-clabe', estado: 'hecho' }
  const ok = validarEvento(base)
  assert.equal(ok.ok, true)
  assert.deepEqual(Object.keys(registro(ok.evento)).sort(), ['categoria', 'codigo', 'estado', 'fecha', 'paso'])
  assert.match(validarEvento({ ...base, nombre: 'Lety' }).error, /no permitido/)
  assert.equal(validarEvento({ ...base, codigo: 'RSP-ABCDE1' }).ok, false) // 1 not in alphabet
  assert.equal(validarEvento({ ...base, categoria: 'otro' }).ok, false)
  assert.equal(validarEvento({ ...base, paso: 'w-aviso' }).ok, false) // step from another category
  assert.equal(validarEvento({ ...base, estado: 'quizá' }).ok, false)
  assert.equal(validarEvento(null).ok, false)
  assert.match(generarCodigo(), CODIGO_RE)
})

test('playbook: every step has source, why, and a known id; rechazo-banco is the conflict step', () => {
  for (const c of Object.values(CATEGORIAS)) {
    for (const p of c.pasos) {
      assert.ok(p.porque.length > 30, p.id)
      assert.ok(p.fuente, p.id)
    }
  }
  assert.ok(PASOS_VALIDOS.has('rechazo-banco'))
})

test('documents: filled values appear, blanks otherwise, no crash on empty', () => {
  const d = generarDocumento('denuncia', { categoria: 'transferencia', nombre: 'Leticia Ejemplo (inventada)', monto: '8000', clabe: '646180157000000004', bancoDestino: 'STP' })
  assert.match(d, /Leticia Ejemplo/)
  assert.match(d, /\$8,000\.00 M\.N\./)
  assert.match(d, /STP/)
  assert.match(generarDocumento('reclamacion', {}), /_{10}/)
  assert.match(generarDocumento('condusef', { categoria: 'tarjeta' }), /CONDUSEF/)
  assert.match(generarDocumento('denuncia', { categoria: 'sat' }), /usurpación de identidad/)
})

import { armarPrompt, numerosNuevos, simplificarSimulado } from '../lib/redactor.js'
test('redactor: prompt only from catalog; new-number guard; simulated fallback', () => {
  assert.equal(armarPrompt('transferencia', 'no-existe'), null)
  assert.match(armarPrompt('transferencia', 't-clabe'), /Texto original/)
  assert.deepEqual(numerosNuevos('Llama al 55 5340 0999', 'Llama al 55 5340 0999 hoy'), [])
  assert.deepEqual(numerosNuevos('Espera 7 días', 'Espera 3 días o llama al 800'), ['3', '800'])
  assert.match(simplificarSimulado('Entrega tu reclamación a la UNE.'), /oficina de quejas/)
})
