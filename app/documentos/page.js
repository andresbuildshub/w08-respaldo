'use client'
import { useEffect, useState } from 'react'
import { CATEGORIAS } from '../../lib/playbook'
import { generarDocumento, TIPOS } from '../../lib/documentos'
import { revisarCLABE } from '../../lib/seguridad'
import { leer, guardar } from '../../lib/local'

// Everything on this page stays in the browser: no fetch, no form submit. The e2e test checks the network.
const CAMPOS = {
  base: [['nombre', 'Tu nombre completo', 'text'], ['lugar', 'Ciudad', 'text'], ['hoy', 'Fecha de hoy', 'text']],
  transferencia: [['fecha', 'Fecha de la transferencia', 'text'], ['hora', 'Hora aproximada', 'text'], ['quien', '¿A nombre de quién te escribieron? (ej. "mi hermano Antonio")', 'text'], ['monto', 'Monto en pesos', 'text'], ['bancoPropio', 'Tu banco', 'text'], ['clabe', 'CLABE a la que transferiste', 'text'], ['rastreo', 'Clave de rastreo (opcional: viene en tu comprobante de la app)', 'text'], ['folio', 'Folio: el número que te dio tu banco cuando llamaste', 'text']],
  tarjeta: [['fecha', 'Fecha del cargo', 'text'], ['monto', 'Monto en pesos', 'text'], ['bancoPropio', 'Tu banco', 'text'], ['folio', 'Folio: el número que te dio tu banco cuando llamaste', 'text']],
  sat: [['fecha', 'Fecha en que te diste cuenta', 'text'], ['rfc', 'Tu RFC', 'text']],
  whatsapp: [],
  condusef: [['folioUNE', 'Folio de tu reclamación en el banco', 'text'], ['fechaUNE', 'Fecha en que la entregaste', 'text'], ['respuesta', 'Qué te contestó el banco (si te contestó)', 'text']],
}

// Persona test: "No tengo impresora. ¿Qué es PDF?" → the phone's own share sheet (WhatsApp to herself, Files, etc.); copy as fallback.
function compartir(texto) {
  if (navigator.share) navigator.share({ title: 'Mi papel', text: texto }).catch(() => {})
  else navigator.clipboard?.writeText(texto)
}

export default function Documentos() {
  const [k, setK] = useState('transferencia')
  const [tipo, setTipo] = useState('denuncia')
  const [f, setF] = useState({})
  const [listo, setListo] = useState(false)
  const [recordar, setRecordar] = useState(false)

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const s = leer()
    const cat = CATEGORIAS[q.get('k')] ? q.get('k') : (s.categoria && s.categoria !== 'whatsapp' ? s.categoria : 'transferencia')
    setK(cat === 'whatsapp' ? 'transferencia' : cat)
    if (q.get('doc') === 'condusef') setTipo('condusef')
    setF({ hoy: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }), clabe: s.clabe || '', bancoDestino: s.bancoDestino || '', ...(s.papeles || {}) })
  }, [])

  const campos = [...CAMPOS.base, ...(CAMPOS[k] || []), ...(tipo === 'condusef' ? CAMPOS.condusef : [])]
  const tipos = k === 'sat' ? ['denuncia'] : Object.keys(TIPOS)
  function cambia(c, v) {
    const nuevo = { ...f, [c]: v.slice(0, 200) }
    if (c === 'clabe') { const r = v.replace(/\D/g, '').length === 18 ? revisarCLABE(v) : null; nuevo.bancoDestino = r?.ok ? r.banco : '' }
    setF(nuevo)
    setListo(false)
  }
  const texto = generarDocumento(tipo, { ...f, categoria: k })

  return (
    <div className="space-y-4">
      <div className="no-imprimir space-y-4">
        <h1 className="text-xl font-bold">Mis papeles</h1>
        <p className="regla text-[15px] leading-snug"><b>Esto se llena en tu teléfono y no se envía a ningún lado.</b> Cuando lo imprimas o lo guardes como PDF, es tuyo. Son modelos, no asesoría legal: confírmalos con la institución.</p>

        <div className="space-y-2">
          <p className="font-semibold">¿Qué te pasó?</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {['transferencia', 'tarjeta', 'sat'].map(c => (
              <button key={c} aria-pressed={k === c} className={`boton ${k === c ? '' : 'boton-sec'}`} onClick={() => { setK(c); if (c === 'sat') setTipo('denuncia'); setListo(false) }}>{CATEGORIAS[c].corto}</button>
            ))}
          </div>
          <p className="font-semibold">¿Qué papel?</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {tipos.map(t => (
              <button key={t} aria-pressed={tipo === t} className={`boton ${tipo === t ? '' : 'boton-sec'}`} onClick={() => { setTipo(t); setListo(false) }}>{TIPOS[t]}</button>
            ))}
          </div>
        </div>

        <form className="tarjeta space-y-3" onSubmit={e => { e.preventDefault(); guardar({ papeles: recordar ? f : undefined }); setListo(true) }}>
          {campos.map(([c, etiqueta]) => (
            <div key={c}>
              <label htmlFor={c}>{etiqueta}</label>
              <input id={c} name={c} autoComplete="off" maxLength={c === 'respuesta' ? 200 : 80} value={f[c] || ''} onChange={e => cambia(c, e.target.value)} />
              {c === 'clabe' && f.bancoDestino && <p className="mt-1 text-sm font-semibold text-verde">Llegó a: {f.bancoDestino}</p>}
              {c === 'nombre' && <p className="mt-1 text-xs text-neutral-600">Tu nombre se queda en este teléfono: lo necesitas en tu papel, nosotros no.</p>}
            </div>
          ))}
          <p className="text-xs text-neutral-600">Lo que dejes en blanco sale con una línea para llenarlo a mano.</p>
          <label className="flex items-start gap-2 text-sm font-normal"><input type="checkbox" className="mt-1 w-auto" checked={recordar} onChange={e => setRecordar(e.target.checked)} /> Recordar estos datos en este teléfono (no lo marques si el teléfono lo usa alguien más).</label>
          <button className="boton w-full" type="submit">Ver mi papel listo</button>
        </form>
      </div>

      {listo && (
        <div className="space-y-3">
          <div className="no-imprimir flex flex-col gap-2 sm:flex-row">
            <button className="boton flex-1" onClick={() => compartir(texto)}>Mandarlo por WhatsApp o guardarlo</button>
            <button className="boton boton-sec flex-1" onClick={() => window.print()}>Imprimir</button>
          </div>
          <p className="no-imprimir text-sm">¿No tienes impresora? Guárdalo en tu teléfono y pide que te lo impriman en una papelería, o enséñalo desde tu teléfono. Las <b>rayitas</b> son para llenarlas a mano si te faltó un dato.</p>
          <pre className="hoja tarjeta whitespace-pre-wrap font-serif text-[15px] leading-relaxed">{texto}</pre>
          {tipo === 'condusef' && <p className="no-imprimir text-sm">Pégalo en el <a className="underline" href="https://www.condusef.gob.mx/?p=contenido&idc=1338&idcat=1" target="_blank" rel="noreferrer">Portal de Queja Electrónica</a> o léelo por teléfono al <a className="underline" href="tel:5553400999">55 5340 0999</a>.</p>}
        </div>
      )}
    </div>
  )
}
