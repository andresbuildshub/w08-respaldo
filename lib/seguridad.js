// Browser-side security tooling. Nothing in this file talks to a network.
import { clabe } from 'clabe-validator'

const sinAcentos = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// ---- CLABE: format, check digit and receiving bank (clabe-validator, MIT) ----
export function revisarCLABE(entrada) {
  const limpio = String(entrada || '').replace(/[\s-]/g, '')
  if (!/^\d+$/.test(limpio)) return { ok: false, mensaje: 'La CLABE solo lleva números.' }
  if (limpio.length !== 18) return { ok: false, mensaje: `La CLABE tiene 18 dígitos; aquí hay ${limpio.length}.` }
  const r = clabe.validate(limpio)
  if (!r.valid.format) return { ok: false, mensaje: 'El último dígito (verificador) no cuadra: revisa que la copiaste bien.' }
  if (!r.valid.bank) return { ok: false, mensaje: 'Los primeros 3 dígitos no corresponden a un banco que conozcamos. Revisa la CLABE.' }
  return { ok: true, banco: r.bank, clave: r.tag, codigo: r.code.bank, mensaje: `Llegó a: ${r.bank}` }
}

// ---- PII guard: what must never be sent anywhere ----
const PATRONES = [
  ['CURP', /\b[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/i],
  ['RFC', /\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/i],
  ['CLABE', /(?<!\d)\d{18}(?!\d)/],
  ['número de tarjeta', /(?<!\d)(?:\d{4}[ -]?){3}\d{4}(?!\d)/],
  ['teléfono', /(?<!\d)(?:\+?52[ -]?)?(?:\d{2}[ -]?\d{4}[ -]?\d{4}|\d{3}[ -]?\d{3}[ -]?\d{4})(?!\d)/],
  ['correo', /\b[\w.+-]+@[\w-]+\.[\w.]+\b/],
]
export function detectarPII(texto) {
  const t = String(texto || '')
  return PATRONES.filter(([, re]) => re.test(t)).map(([n]) => n)
}

// ---- Clone detector: Respaldo never writes first and never asks for any of this ----
const REGLAS = [
  ['pide_codigo', 'Pide un código o clave de verificación', /\b(codigo|clave de verificacion|token|codigo de seguridad)\b|\b\d{6}\b.*\b(llego|llego|mandaron)\b/],
  ['pide_nip', 'Pide tu NIP o contraseña', /\b(nip|contrasena|password)\b/],
  ['pide_tarjeta', 'Pide datos de tu tarjeta', /(numero de (tu )?tarjeta|16 digitos|cvv|codigo de seguridad de (tu )?tarjeta|fecha de vencimiento)/],
  ['pide_transferir', 'Te pide transferir o depositar', /(transfier|transferir|deposit|cuenta segura|cuenta de resguardo|mueve tu dinero)/],
  ['pide_instalar', 'Te pide instalar algo o dar acceso remoto', /(instala|descarga (la |una )?app|anydesk|teamviewer|\.apk|acceso remoto)/],
  ['link', 'Trae un enlace', /(https?:\/\/|www\.|bit\.ly|\.ly\/)/],
  ['urgencia', 'Te apura', /(urgente|de inmediato|inmediatamente|en los proximos|ultima oportunidad|se perdera|hoy mismo)/],
  ['recuperar', 'Promete recuperar tu dinero', /(recuperar tu dinero|recuperamos tu dinero|reembolso|devolver(te)? tu dinero|te devolvemos)/],
  ['dice_respaldo', 'Dice ser de Respaldo, de tu banco o de CONDUSEF', /(respaldo|area de fraudes|departamento de fraudes|soy (de|del) (banco|condusef)|somos (de|del) (banco|condusef))/],
]
const GRAVES = new Set(['pide_codigo', 'pide_nip', 'pide_tarjeta', 'pide_transferir', 'pide_instalar'])

export function esClon(texto, { tuEscribistePrimero = false } = {}) {
  const t = sinAcentos(texto)
  const hits = REGLAS.filter(([, , re]) => re.test(t)).map(([id, desc]) => ({ id, desc }))
  const ids = new Set(hits.map(h => h.id))
  const razones = hits.map(h => h.desc)
  if ([...ids].some(i => GRAVES.has(i))) return { veredicto: 'fraude', razones }
  if (ids.has('dice_respaldo') && !tuEscribistePrimero) return { veredicto: 'fraude', razones: [...razones, 'Te escribió primero: Respaldo nunca lo hace'] }
  if (ids.has('link') || ids.has('urgencia') || ids.has('recuperar')) return { veredicto: 'sospechoso', razones }
  return { veredicto: 'sin_senales', razones }
}
