'use client'
import { useState } from 'react'
import { CATEGORIAS } from '../../../lib/playbook'

const OPCIONES = Object.entries(CATEGORIAS).flatMap(([k, c]) => c.pasos.map(p => ({ k, id: p.id, t: `${c.corto} · ${p.titulo}` })))

export default function Redactar() {
  const [sel, setSel] = useState(0)
  const [r, setR] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [decision, setDecision] = useState(null)

  async function generar() {
    setCargando(true); setR(null); setDecision(null)
    const o = OPCIONES[sel]
    try {
      const res = await fetch('/api/redactar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ categoria: o.k, pasoId: o.id }) })
      setR(await res.json())
    } catch { setR({ error: 'No se pudo conectar' }) }
    setCargando(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Redactar pasos con IA</h1>
      <p className="regla text-[15px] leading-snug">La IA <b>solo</b> recibe el texto fijo del paso que eliges aquí. Nunca recibe lo que escribe una víctima. Su borrador <b>no se publica solo</b>: una persona lo aprueba, y el texto aprobado entra en el siguiente despliegue como texto fijo, igual para todos.</p>
      <div className="tarjeta space-y-3">
        <label htmlFor="paso">Paso del plan</label>
        <select id="paso" value={sel} onChange={e => { setSel(Number(e.target.value)); setR(null) }}>
          {OPCIONES.map((o, i) => <option key={`${o.k}-${o.id}`} value={i}>{o.t}</option>)}
        </select>
        <button className="boton w-full" disabled={cargando} onClick={generar}>{cargando ? 'Generando…' : 'Generar borrador más sencillo'}</button>
      </div>
      {r?.error && <p className="text-rojo">{r.error}</p>}
      {r && !r.error && (
        <div className="space-y-3">
          {r.modo === 'simulado' && <p className="text-sm"><span className="etiqueta">SIMULADO</span> {r.razon} Este borrador lo hizo una regla fija (cortar frases largas y explicar siglas), no un modelo.</p>}
          {r.modo === 'real' && <p className="text-sm"><span className="etiqueta">IA</span> Borrador de {r.modelo} vía Vercel AI Gateway.</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="tarjeta"><p className="text-xs font-bold uppercase">Texto actual</p><p className="mt-1 whitespace-pre-wrap text-[15px]">{r.original}</p></div>
            <div className="tarjeta"><p className="text-xs font-bold uppercase">Borrador</p><p className="mt-1 whitespace-pre-wrap text-[15px]">{r.borrador}</p></div>
          </div>
          {r.alertas?.length > 0 && <ul className="alerta list-disc pl-8 text-sm">{r.alertas.map(a => <li key={a}>{a}</li>)}</ul>}
          {!decision && (
            <div className="grid grid-cols-2 gap-2">
              <button className="boton" onClick={() => setDecision('aprobado')} disabled={r.alertas?.length > 0}>Aprobar para el siguiente despliegue</button>
              <button className="boton boton-sec" onClick={() => setDecision('rechazado')}>Rechazar</button>
            </div>
          )}
          {decision && <p className="tarjeta">{decision === 'aprobado' ? '✓ Aprobado. (En esta demostración la aprobación no cambia el sitio: en operación real, quien revisa lo pasa al catálogo y se publica en el siguiente despliegue.)' : 'Rechazado. El texto actual se queda igual.'}</p>}
        </div>
      )}
    </div>
  )
}
