'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Regla from '../../components/Regla'
import { CATEGORIAS, FUENTES } from '../../lib/playbook'
import { revisarCLABE } from '../../lib/seguridad'
import { ics } from '../../lib/operacion'
import { leer, guardar, borrarTodo, codigoDesdeURL, codigoDemo, enviarEstado } from '../../lib/local'

// Stages: amenaza → categoria → (transferencia/tarjeta: urgencia) → plan
export default function Caso() {
  const [s, setS] = useState(null)

  useEffect(() => {
    const previo = leer()
    const deURL = codigoDesdeURL()
    let base = previo
    if (deURL && deURL !== previo.codigo) base = { codigo: deURL, etapa: 'amenaza', estados: {} }
    if (!base.etapa || base.etapa === 'inicio') base = { ...base, etapa: 'amenaza' }
    const k = new URLSearchParams(window.location.search).get('k')
    if (k && CATEGORIAS[k] && base.etapa === 'amenaza' && deURL) base = { ...base, categoria: k, etapa: 'plan' } // arriving from a calendar reminder
    setS(guardar(base))
  }, [])

  const set = (p) => setS(guardar(p))
  if (!s) return <p>Cargando…</p>

  if (!s.codigo) {
    return (
      <div className="space-y-4">
        <Regla />
        <div className="tarjeta space-y-3">
          <p>Respaldo se abre desde la app o la línea de fraudes de tu banco, con un código de caso.</p>
          <p className="text-sm"><span className="etiqueta">SIMULADO</span> Para la demostración puedes crear un código de prueba.</p>
          <button className="boton w-full" onClick={() => { const c = codigoDemo(); set({ codigo: c, etapa: 'amenaza', estados: {} }); history.replaceState(null, '', `/caso?c=${c}`) }}>Crear código de prueba</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-600">Caso <b>{s.codigo}</b> · lo que marques se guarda en este teléfono</p>
      {s.etapa === 'amenaza' && <Amenaza s={s} set={set} />}
      {s.etapa === 'categoria' && <Categoria set={set} />}
      {s.etapa === 'urgencia' && <Urgencia s={s} set={set} />}
      {s.etapa === 'plan' && <Plan s={s} set={set} />}
    </div>
  )
}

function Amenaza({ s, set }) {
  const [peligro, setPeligro] = useState(false)
  return (
    <>
      <Regla />
      <h1 className="text-xl font-bold">¿Alguien te está amenazando o extorsionando ahora mismo?</h1>
      {!peligro ? (
        <div className="space-y-2">
          <button className="opcion" onClick={() => setPeligro(true)}>Sí</button>
          <button className="opcion" onClick={() => set({ etapa: 'categoria' })}>No, sigamos</button>
        </div>
      ) : (
        <div className="alerta space-y-2">
          <p className="text-lg font-bold">Esto no lo resuelve una página.</p>
          <p>Si estás en peligro llama al <a className="underline" href="tel:911"><b>911</b></a>. Para denunciar extorsión de forma anónima: <a className="underline" href="tel:089"><b>089</b></a>.</p>
          <p className="text-sm">No pagues ni sigas hablando con quien te amenaza.</p>
          <button className="boton boton-sec mt-1" onClick={() => set({ etapa: 'categoria' })}>Ya estoy a salvo: seguir con mi caso</button>
        </div>
      )}
    </>
  )
}

function Categoria({ set }) {
  return (
    <>
      <h1 className="text-xl font-bold">¿Qué te pasó?</h1>
      <p className="text-sm text-neutral-700">Escoge la que más se parezca. Puedes cambiarla después.</p>
      <div className="space-y-2">
        {Object.entries(CATEGORIAS).map(([k, c]) => (
          <button key={k} className="opcion" onClick={() => set({ categoria: k, etapa: (k === 'transferencia' || k === 'tarjeta') ? 'urgencia' : 'plan' })}>{c.titulo}</button>
        ))}
      </div>
    </>
  )
}

function Urgencia({ s, set }) {
  const [reciente, setReciente] = useState(null)
  const esTarjeta = s.categoria === 'tarjeta'
  return (
    <>
      <h1 className="text-xl font-bold">{esTarjeta ? '¿Ya bloqueaste tu tarjeta?' : '¿Hace cuánto hiciste la transferencia?'}</h1>
      {reciente === null && (
        <div className="space-y-2">
          <button className="opcion" onClick={() => setReciente(true)}>{esTarjeta ? 'Todavía no' : 'Hace menos de 1 hora'}</button>
          <button className="opcion" onClick={() => set({ etapa: 'plan' })}>{esTarjeta ? 'Sí, ya la bloqueé' : 'Hace más de 1 hora'}</button>
        </div>
      )}
      {reciente && (
        <div className="alerta space-y-2">
          <p className="text-lg font-bold">{esTarjeta ? 'Bloquéala ahora, desde la app de tu banco o con el número atrás de tu tarjeta.' : 'Llama YA al número que viene atrás de tu tarjeta.'}</p>
          <p>{esTarjeta ? 'Así no pueden hacer más cargos.' : 'Tu banco es el único que puede intentar detener el dinero, y cada minuto cuenta. Esto no lo hace un bot ni lo hace Respaldo.'}</p>
          <p className="text-sm">Pide un <b>número de folio</b> y anótalo.</p>
          <button className="boton boton-sec mt-1" onClick={() => set({ etapa: 'plan' })}>{esTarjeta ? 'Ya la bloqueé: ver mi plan' : 'Ya llamé: ver mi plan'}</button>
        </div>
      )}
    </>
  )
}

function Plan({ s, set }) {
  const cat = CATEGORIAS[s.categoria]
  const estados = s.estados || {}
  const hechos = cat.pasos.filter(p => estados[p.id]).length

  function marcar(id) {
    const nuevo = !estados[id]
    set({ estados: { ...estados, [id]: nuevo } })
    enviarEstado(s.codigo, s.categoria, id, nuevo ? 'hecho' : 'pendiente')
  }
  function descargarICS() {
    const blob = new Blob([ics({ codigo: s.codigo, categoria: s.categoria, origen: window.location.origin })], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'respaldo-recordatorios.ics'; a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  return (
    <>
      <Regla compacta />
      <div className="flex items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold">Tu plan: {cat.corto}</h1>
        <span className="text-sm text-neutral-600">{hechos} de {cat.pasos.length}</span>
      </div>
      <p className="tarjeta text-[15px] leading-snug">{cat.verdad}</p>
      <ol className="space-y-3">
        {cat.pasos.map(p => (
          <li key={p.id} className={`tarjeta ${estados[p.id] ? 'opacity-70' : ''}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-azul">{p.dia}</p>
            <p className="font-semibold leading-snug">{p.titulo}</p>
            <p className="mt-1 text-[15px] leading-snug">{p.porque}</p>
            {p.herramienta === 'clabe' && <RevisarCLABE s={s} set={set} />}
            {p.herramienta === 'documentos' && <Link className="boton boton-sec mt-2 w-full" href={`/documentos?k=${s.categoria}`}>Preparar mis papeles</Link>}
            {p.herramienta === 'condusef' && <Link className="boton boton-sec mt-2 w-full" href={`/documentos?k=${s.categoria}&doc=condusef`}>Armar mi queja para CONDUSEF</Link>}
            {p.herramienta === 'aviso' && <Aviso />}
            <div className="mt-2 flex items-center justify-between gap-2">
              <a className="text-xs text-neutral-600 underline" href={FUENTES[p.fuente].url} target="_blank" rel="noreferrer">Fuente: {FUENTES[p.fuente].nombre}</a>
              <button aria-pressed={!!estados[p.id]} className={`boton shrink-0 ${estados[p.id] ? '' : 'boton-sec'}`} onClick={() => marcar(p.id)}>{estados[p.id] ? '✓ Hecho' : 'Ya lo hice'}</button>
            </div>
          </li>
        ))}
      </ol>
      <div className="tarjeta space-y-2">
        <p className="font-semibold">Recordatorios en tu calendario</p>
        <p className="text-sm">Respaldo no te va a escribir. Si quieres que te recuerden el día 7 y el día 30, guárdalos en <b>tu</b> calendario: el aviso sale de tu teléfono, no de nosotros.</p>
        <button className="boton w-full" onClick={descargarICS}>Poner recordatorios en mi calendario</button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button className="boton boton-sec flex-1" onClick={() => set({ etapa: 'categoria' })}>Me equivoqué de opción</button>
        <button className="boton boton-sec flex-1" onClick={() => { if (confirm('¿Borrar todo lo de este caso de este teléfono?')) { borrarTodo(); location.href = '/' } }}>Borrar mis datos de este teléfono</button>
      </div>
    </>
  )
}

function RevisarCLABE({ s, set }) {
  const [txt, setTxt] = useState(s.clabe || '')
  const r = txt.replace(/\D/g, '').length >= 18 ? revisarCLABE(txt) : null
  return (
    <div className="mt-2 rounded-xl bg-arena p-3">
      <label htmlFor="clabe">CLABE a la que transferiste (18 números)</label>
      <input id="clabe" inputMode="numeric" autoComplete="off" maxLength={24} value={txt} placeholder="Está en tu comprobante"
        onChange={e => { const v = e.target.value.replace(/[^\d\s]/g, ''); setTxt(v); const rr = v.replace(/\D/g, '').length === 18 ? revisarCLABE(v) : null; set({ clabe: v, bancoDestino: rr?.ok ? rr.banco : '' }) }} />
      {r && <p className={`mt-2 font-semibold ${r.ok ? 'text-verde' : 'text-rojo'}`}>{r.mensaje}</p>}
      <p className="mt-1 text-xs text-neutral-600">Se revisa en tu teléfono con el dígito verificador de la CLABE. No se envía a ningún lado.</p>
    </div>
  )
}

function Aviso() {
  const texto = 'Me robaron mi WhatsApp. Si te escribo pidiendo dinero, NO SOY YO. No transfieras nada y avisa a los demás.'
  const [ok, setOk] = useState(false)
  return (
    <div className="mt-2 rounded-xl bg-arena p-3">
      <p className="text-[15px]">“{texto}”</p>
      <button className="boton boton-sec mt-2 w-full" onClick={() => { navigator.clipboard?.writeText(texto).then(() => setOk(true)).catch(() => {}) }}>{ok ? '✓ Copiado' : 'Copiar aviso'}</button>
      <p className="mt-1 text-xs text-neutral-600">Mándalo por SMS o desde el teléfono de alguien más, no desde la cuenta robada.</p>
    </div>
  )
}
