import { generateText } from 'ai'
import { CATEGORIAS, paso } from '../../../lib/playbook'
import { MODELO, SISTEMA, armarPrompt, simplificarSimulado, numerosNuevos, numerosPerdidos } from '../../../lib/redactor'

export const maxDuration = 60
const golpes = new Map()
function excedido(ip) {
  const ahora = Date.now()
  const r = (golpes.get(ip) || []).filter(t => ahora - t < 10 * 60 * 1000)
  r.push(ahora); golpes.set(ip, r)
  return r.length > 10
}

export async function POST(req) {
  let b
  try { b = await req.json() } catch { return Response.json({ error: 'Solicitud inválida' }, { status: 400 }) }
  if (typeof b !== 'object' || !b || Object.keys(b).some(k => !['categoria', 'pasoId'].includes(k))) return Response.json({ error: 'Solo se aceptan categoria y pasoId' }, { status: 400 })
  if (!CATEGORIAS[b.categoria] || !paso(b.categoria, b.pasoId)) return Response.json({ error: 'Paso fuera del catálogo' }, { status: 400 })
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
  if (excedido(ip)) return Response.json({ error: 'Demasiadas solicitudes. Espera unos minutos.' }, { status: 429 })

  const original = paso(b.categoria, b.pasoId).porque
  try {
    const { text } = await generateText({ model: MODELO, system: SISTEMA, prompt: armarPrompt(b.categoria, b.pasoId), maxOutputTokens: 300 })
    const borrador = text.trim()
    return Response.json({ modo: 'real', modelo: MODELO, original, borrador, alertas: [
      ...numerosNuevos(original, borrador).map(n => `El borrador agrega el número "${n}" que no está en el original.`),
      ...numerosPerdidos(original, borrador).map(n => `El borrador quitó el número "${n}" que sí está en el original.`),
    ] })
  } catch (e) {
    const msg = String(e?.message || '') + ' ' + String(e?.responseBody || '')
    console.error('gateway:', e?.name, msg.slice(0, 200))
    const razon = /customer_verification|credit card|403|forbidden|free tier/i.test(msg) ? 'El plan gratuito de AI Gateway del equipo de clase no da acceso a este modelo (403).'
      : /429|rate/i.test(msg) ? 'AI Gateway limitó las solicitudes del plan gratuito (429).'
      : 'No se pudo llamar al modelo.'
    return Response.json({ modo: 'simulado', razon, original, borrador: simplificarSimulado(original), alertas: [] })
  }
}
