import { NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'
import { randomBytes } from 'node:crypto'
import { validarEvento, registro } from '../../../lib/operacion'

export const dynamic = 'force-dynamic'
const PREFIJO = 'eventos/'

// POST: one immutable JSON per step state. The ONLY fields that exist: codigo, categoria, paso, estado (+ fecha).
export async function POST(req) {
  const crudo = await req.text()
  if (crudo.length > 1024) return NextResponse.json({ error: 'Demasiado grande' }, { status: 413 })
  let body
  try { body = JSON.parse(crudo) } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }
  const v = validarEvento(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })
  const reg = registro(v.evento)
  const nombre = `${PREFIJO}${reg.categoria}/${reg.paso}/${reg.estado}/${reg.fecha}/${reg.codigo}-${Date.now()}-${randomBytes(3).toString('hex')}.json`
  try {
    await put(nombre, JSON.stringify(reg), { access: 'private', contentType: 'application/json', addRandomSuffix: false })
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar' }, { status: 503 })
  }
  return NextResponse.json({ ok: true, guardado: reg })
}

// GET: counts read from pathnames only (eventos/<categoria>/<paso>/<estado>/<fecha>/<codigo>-…). The latest state per code+step wins.
export async function GET() {
  const ultimo = new Map() // key codigo|categoria|paso → {estado, t}
  let cursor
  try {
    do {
      const r = await list({ prefix: PREFIJO, cursor, limit: 1000 })
      for (const b of r.blobs) {
        const [, categoria, paso, estado, fecha, archivo] = b.pathname.split('/')
        const partes = (archivo || '').replace('.json', '').split('-') // RSP · ABCDEF · <ms> · <rand>
        const codigo = `${partes[0]}-${partes[1]}`
        const t = Number(partes[2]) || 0
        const clave = `${codigo}|${categoria}|${paso}`
        const prev = ultimo.get(clave)
        if (!prev || t > prev.t) ultimo.set(clave, { codigo, categoria, paso, estado, fecha, t })
      }
      cursor = r.hasMore ? r.cursor : undefined
    } while (cursor)
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el conteo' }, { status: 503 })
  }
  const porPaso = {}
  const codigos = new Set()
  const codigosPorCategoria = {}
  for (const e of ultimo.values()) {
    codigos.add(e.codigo)
    ;(codigosPorCategoria[e.categoria] ??= new Set()).add(e.codigo)
    if (e.estado !== 'hecho') continue
    porPaso[e.categoria] ??= {}
    porPaso[e.categoria][e.paso] = (porPaso[e.categoria][e.paso] || 0) + 1
  }
  return NextResponse.json({
    casos: codigos.size,
    casosPorCategoria: Object.fromEntries(Object.entries(codigosPorCategoria).map(([k, v]) => [k, v.size])),
    hechosPorPaso: porPaso,
    quejasContraPagador: Object.values(porPaso).reduce((a, c) => a + (c['rechazo-banco'] || 0), 0),
  })
}
