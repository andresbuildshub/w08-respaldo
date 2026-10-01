// The ONLY place an LLM touches content: drafting plainer wording of a FIXED playbook step, for a human to approve.
// Input is a step id; the text sent to the model comes from the catalog, never from a user.
import { CATEGORIAS, paso } from './playbook.js'

export const MODELO = 'anthropic/claude-sonnet-5'

export const SISTEMA = `Eres editor de textos de servicio público en México. Reescribes instrucciones para una persona de 58 años que lee despacio, usa WhatsApp y desconfía de las apps.
Reglas: español de México, frases de máximo 15 palabras, "tú", sin tecnicismos (si uno es inevitable, explícalo en paréntesis).
NO agregues pasos, números de teléfono, direcciones, plazos ni instituciones que no estén en el texto original. NO quites advertencias.
Devuelve solo el texto reescrito, máximo 70 palabras.`

export function armarPrompt(categoria, pasoId) {
  const p = paso(categoria, pasoId)
  if (!p) return null
  return `Situación: ${CATEGORIAS[categoria].titulo}.\nPaso: ${p.titulo}\nTexto original:\n${p.porque}`
}

// Deterministic fallback, labeled SIMULADO on screen: split long sentences, swap known jargon.
const GLOSARIO = [[/\bUNE\b/g, 'la oficina de quejas del banco (UNE)'], [/\bCEP\b/g, 'comprobante (CEP)'], [/\bSPEI\b/g, 'transferencia (SPEI)'], [/verificación en dos pasos/g, 'verificación en dos pasos (un PIN extra)']]
export function simplificarSimulado(texto) {
  let t = String(texto)
  for (const [re, r] of GLOSARIO) t = t.replace(re, r)
  return t.split(/(?<=[.:])\s+/).map(f => f.length > 110 ? f.replace(/, (y|pero|porque|para) /, '. $1 ').replace(/^\w/, c => c.toUpperCase()) : f).join('\n')
}

// Guard: a draft must not introduce digits (phones, deadlines, amounts) absent from the original.
export function numerosNuevos(original, borrador) {
  const enOriginal = new Set(String(original).match(/\d+/g) || [])
  return (String(borrador).match(/\d+/g) || []).filter(n => !enOriginal.has(n))
}
