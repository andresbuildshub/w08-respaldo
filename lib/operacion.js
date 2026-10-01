// Operator math and the only data the server ever accepts.
import { CATEGORIAS, pasoPertenece } from './playbook.js'

// ---- Honest queue ----
// llegadasHoy: cases that arrived today; capacity = humans × hours × 60 / minutes per case.
// What's over capacity waits; it clears only at (capacity − normal daily arrivals).
// The range is ±20% on the clear rate, because a real clear rate wobbles; never shown as a promise.
export function colaHonesta({ llegadasHoy, humanos, minutosPorCaso, nuevosPorDia, horasPorHumano = 6 }) {
  const capacidad = Math.floor((humanos * horasPorHumano * 60) / minutosPorCaso)
  const rezago = Math.max(0, llegadasHoy - capacidad)
  const neto = capacidad - nuevosPorDia
  if (rezago === 0) return { capacidad, rezago, neto, crece: false, diasMin: 0, diasMax: 0, semanasMin: 0, semanasMax: 0 }
  if (neto <= 0) return { capacidad, rezago, neto, crece: true, diasMin: Infinity, diasMax: Infinity, semanasMin: Infinity, semanasMax: Infinity }
  const diasMin = Math.ceil(rezago / (neto * 1.2))
  const diasMax = Math.ceil(rezago / (neto * 0.8))
  return { capacidad, rezago, neto, crece: false, diasMin, diasMax, semanasMin: Math.ceil(diasMin / 5), semanasMax: Math.ceil(diasMax / 5) }
}

// Wait for the person in position `posicion` of today's arrivals.
export function esperaDe(posicion, q) {
  if (posicion <= q.capacidad) return { hoy: true, diasMin: 0, diasMax: 0 }
  if (q.crece) return { hoy: false, crece: true }
  const delante = posicion - q.capacidad
  return { hoy: false, diasMin: Math.ceil(delante / (q.neto * 1.2)), diasMax: Math.ceil(delante / (q.neto * 0.8)) }
}

// ---- Case codes (issued by the bank in the real thing; SIMULADO here) ----
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I, O, 0, 1
export const CODIGO_RE = /^RSP-[A-HJ-NP-Z2-9]{6}$/
export function generarCodigo(rnd = (n) => crypto.getRandomValues(new Uint8Array(n))) {
  const b = rnd(6)
  return 'RSP-' + Array.from(b, x => ALFABETO[x % ALFABETO.length]).join('')
}

// ---- Step events: the ONLY thing stored ----
const PERMITIDAS = ['codigo', 'categoria', 'paso', 'estado']
export function validarEvento(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { ok: false, error: 'Cuerpo inválido' }
  const extra = Object.keys(body).filter(k => !PERMITIDAS.includes(k))
  if (extra.length) return { ok: false, error: `Campo no permitido: ${extra.join(', ')}. Respaldo no guarda nada más.` }
  const { codigo, categoria, paso, estado } = body
  if (typeof codigo !== 'string' || !CODIGO_RE.test(codigo)) return { ok: false, error: 'Código inválido' }
  if (!Object.hasOwn(CATEGORIAS, categoria)) return { ok: false, error: 'Categoría inválida' }
  if (typeof paso !== 'string' || !pasoPertenece(categoria, paso)) return { ok: false, error: 'Paso inválido' }
  if (estado !== 'hecho' && estado !== 'pendiente') return { ok: false, error: 'Estado inválido' }
  return { ok: true, evento: { codigo, categoria, paso, estado } }
}
export function registro(evento, ahora = new Date()) {
  // fecha in Mexico City (UTC−6, no DST since 2022)
  const mx = new Date(ahora.getTime() - 6 * 3600 * 1000)
  return { ...evento, fecha: mx.toISOString().slice(0, 10) }
}

// ---- Calendar reminders (RFC 5545). Her calendar, not our messages. ----
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, '')
export function ics({ codigo, categoria, base = new Date(), origen = 'https://w08-respaldo.vercel.app' }) {
  const dias = [[7, '¿Te contestó el banco? Si no, o te dijeron que no: queja en CONDUSEF'], [30, 'Revisa cómo va tu caso (denuncia, banco, CONDUSEF)']]
  const sello = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  const ev = dias.map(([n, txt]) => {
    const d = new Date(base.getTime() + n * 86400000)
    const fin = new Date(d.getTime() + 86400000)
    return ['BEGIN:VEVENT', `UID:${codigo}-d${n}@respaldo`, `DTSTAMP:${sello}`, `DTSTART;VALUE=DATE:${ymd(d)}`, `DTEND;VALUE=DATE:${ymd(fin)}`,
      `SUMMARY:Respaldo (día ${n}): ${txt}`, `DESCRIPTION:Tu plan: ${origen}/caso?c=${codigo}&k=${categoria}\\nRespaldo nunca te escribe primero.`, 'END:VEVENT'].join('\r\n')
  })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Respaldo//ES', 'CALSCALE:GREGORIAN', ...ev, 'END:VCALENDAR', ''].join('\r\n')
}
