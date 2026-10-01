'use client'
// Everything about her case lives in THIS phone's storage. Wrapped: private windows can throw.
import { CODIGO_RE, generarCodigo } from './operacion.js'

const K = 'respaldo.v1'
export function leer() {
  try { return JSON.parse(localStorage.getItem(K) || '{}') } catch { return {} }
}
export function guardar(parcial) {
  const s = { ...leer(), ...parcial }
  try { localStorage.setItem(K, JSON.stringify(s)) } catch {}
  return s
}
export function borrarTodo() {
  try { localStorage.removeItem(K) } catch {}
}
export function codigoDesdeURL() {
  try {
    const c = new URLSearchParams(window.location.search).get('c')
    return c && CODIGO_RE.test(c) ? c : null
  } catch { return null }
}
export function codigoDemo() { return generarCodigo() }

// Fire-and-forget: only {codigo, categoria, paso, estado}. Nothing else exists to send.
export function enviarEstado(codigo, categoria, paso, estado) {
  if (!codigo) return
  try {
    fetch('/api/eventos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ codigo, categoria, paso, estado }), keepalive: true }).catch(() => {})
  } catch {}
}
