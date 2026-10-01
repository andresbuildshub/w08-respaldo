'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CATEGORIAS } from '../../lib/playbook'
import { colaHonesta, esperaDe } from '../../lib/operacion'

const PRESETS = {
  normal: { llegadasHoy: 15, humanos: 2, minutosPorCaso: 30, nuevosPorDia: 15 },
  viral: { llegadasHoy: 300, humanos: 2, minutosPorCaso: 30, nuevosPorDia: 15 },
}
// Invented, labeled: what a public per-bank tally would look like once there are paying banks.
const TABLERO_SIMULADO = [['Banco A (inventado)', 14, 3], ['Banco B (inventado)', 9, 0], ['Banco C (inventado)', 22, 7]]

export default function Operador() {
  const [datos, setDatos] = useState(null)
  const [err, setErr] = useState(false)
  const [p, setP] = useState(PRESETS.viral)
  const [pos, setPos] = useState(200)

  useEffect(() => { fetch('/api/eventos').then(r => r.json()).then(setDatos).catch(() => setErr(true)) }, [])

  const q = colaHonesta(p)
  const e = esperaDe(pos, q)
  const num = (k, v) => setP({ ...p, [k]: Math.max(k === 'nuevosPorDia' ? 0 : 1, Math.min(2000, Number(v) || 0)) })

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Operador</h1>
      <p className="text-sm">Para quien atiende la fila (en el banco o en Respaldo). Aquí no hay nombres: solo códigos de caso y pasos.</p>

      <section className="tarjeta space-y-2">
        <h2 className="font-bold">Casos reales en esta URL</h2>
        {err && <p className="text-rojo">No se pudo leer el conteo.</p>}
        {!datos && !err && <p>Cargando…</p>}
        {datos && (
          <>
            <p><b>{datos.casos}</b> códigos de caso distintos han marcado al menos un paso. <span className="text-xs text-neutral-600">(Incluye pruebas de la clase, por ejemplo RSP-TESTAB.)</span></p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left"><th className="py-1">Paso</th><th className="py-1 text-right">Casos que lo marcaron</th></tr></thead>
                <tbody>
                  {Object.entries(CATEGORIAS).map(([k, c]) => (
                    <FilasCategoria key={k} c={c} hechos={datos.hechosPorPaso[k] || {}} casos={datos.casosPorCategoria[k] || 0} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="tarjeta space-y-3">
        <h2 className="font-bold">Fila honesta</h2>
        <p className="text-sm">Cuántas personas puede atender un humano hoy y cuánto espera la que llegó en el lugar que elijas. Se muestra como rango, nunca como promesa.</p>
        <div className="flex flex-wrap gap-2">
          <button className={`boton ${p === PRESETS.normal ? '' : 'boton-sec'}`} onClick={() => setP(PRESETS.normal)}>Día normal</button>
          <button className={`boton ${p === PRESETS.viral ? '' : 'boton-sec'}`} onClick={() => setP(PRESETS.viral)}>Martes viral ("hackean WhatsApp")</button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[['llegadasHoy', 'Llegaron hoy'], ['humanos', 'Humanos'], ['minutosPorCaso', 'Minutos por caso'], ['nuevosPorDia', 'Nuevos por día normal']].map(([k, t]) => (
            <div key={k}><label htmlFor={k}>{t}</label><input id={k} type="number" inputMode="numeric" value={p[k]} onChange={ev => num(k, ev.target.value)} /></div>
          ))}
        </div>
        <ul className="text-[15px] leading-snug">
          <li>Capacidad: <b>{q.capacidad}</b> personas por día (6 h efectivas por humano).</li>
          <li>Se quedan esperando: <b>{q.rezago}</b>.</li>
          {q.rezago > 0 && !q.crece && <li>La fila baja <b>{q.neto}</b> por día (capacidad menos los casos nuevos de un día normal) → se vacía en <b>{q.diasMin}–{q.diasMax} días hábiles</b> (≈ {q.semanasMin}–{q.semanasMax} semanas).</li>}
        </ul>
        {q.crece && <p className="alerta">La fila crece cada día: con esta gente nunca se vacía. Eso es un problema de personal, no de mensaje.</p>}
        {!q.crece && q.rezago > 0 && q.diasMax > 10 && (
          <p className="regla text-sm"><b>Más de dos semanas de espera.</b> Cláusula de saturación: el banco pone agentes en los pasos SIN conflicto (denuncia, pruebas). La queja contra el propio banco <b>nunca</b> la toma el banco: la persona ya tiene su texto listo para CONDUSEF.</p>
        )}
        <div className="rounded-xl bg-arena p-3">
          <label htmlFor="pos">Lo que ve la persona número…</label>
          <input id="pos" type="number" inputMode="numeric" value={pos} onChange={ev => setPos(Math.max(1, Math.min(5000, Number(ev.target.value) || 1)))} />
          <p className="mt-2 text-[15px] leading-snug">
            {e.hoy && '“Hoy te atiende una persona. No te vamos a escribir: entra a tu caso desde la app de tu banco.”'}
            {!e.hoy && e.crece && '“Hoy nos escribieron más personas de las que podemos atender, y no podemos darte una fecha honesta. Lo urgente ya lo hiciste: tu banco tiene tu reporte y tus papeles están listos para imprimir.”'}
            {!e.hoy && !e.crece && `“Hoy nos escribieron ${p.llegadasHoy} personas. No te vamos a escribir. Una persona revisa tu caso en ${e.diasMin} a ${e.diasMax} días hábiles; lo verás en la app de tu banco. Lo urgente ya lo hiciste: tu banco tiene tu reporte y tus papeles están listos para imprimir.”`}
          </p>
        </div>
      </section>

      <section className="tarjeta space-y-2">
        <h2 className="font-bold">Lo que el bot nunca atiende</h2>
        <ol className="list-decimal pl-5 text-[15px] leading-snug">
          <li><b>Dinero que se está moviendo ahora</b> → la línea 24 h del banco.</li>
          <li><b>Amenazas o extorsión</b> → 911 / 089.</li>
          <li><b>Revisar la respuesta del banco</b> antes de ir a CONDUSEF → humano, y si es el banco que paga, nadie de Respaldo: la queja va directa.</li>
        </ol>
      </section>

      <section className="tarjeta space-y-2">
        <h2 className="font-bold">Tablero público de conflicto</h2>
        <p className="text-[15px]">Quejas a CONDUSEF entregadas contra el banco que paga (paso "¿Tu banco rechazó tu reclamación?"): <b>{datos ? datos.quejasContraPagador : '…'}</b> <span className="text-xs text-neutral-600">(real, en esta URL)</span></p>
        <p className="text-sm"><span className="etiqueta">SIMULADO</span> Así se vería por banco cuando haya bancos que paguen:</p>
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Banco</th><th className="text-right">Casos</th><th className="text-right">Quejas contra él</th></tr></thead>
          <tbody>{TABLERO_SIMULADO.map(([b, c, qq]) => <tr key={b}><td>{b}</td><td className="text-right">{c}</td><td className="text-right">{qq}</td></tr>)}</tbody>
        </table>
      </section>

      <Link className="boton w-full" href="/operador/redactar">Redactar pasos con IA (siempre con aprobación humana)</Link>
    </div>
  )
}

function FilasCategoria({ c, hechos, casos }) {
  return (
    <>
      <tr><td colSpan={2} className="pt-3 font-semibold">{c.corto} · {casos} casos</td></tr>
      {c.pasos.map(x => (
        <tr key={x.id} className="border-t border-arena"><td className="py-1 pr-2">{x.titulo}</td><td className="py-1 text-right">{hechos[x.id] || 0}</td></tr>
      ))}
    </>
  )
}
