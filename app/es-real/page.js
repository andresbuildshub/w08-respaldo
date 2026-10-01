'use client'
import { useState } from 'react'
import Regla from '../../components/Regla'
import { esClon, detectarPII } from '../../lib/seguridad'

const EJEMPLO = 'Hola, le escribimos de Respaldo, aliado de su banco. Para recuperar su dinero necesitamos el código de 6 dígitos que le acaba de llegar por SMS. Es urgente, su caso se cierra hoy.'

export default function EsReal() {
  const [txt, setTxt] = useState('')
  const [primero, setPrimero] = useState(null)
  const r = txt.trim().length >= 10 && primero !== null ? esClon(txt, { tuEscribistePrimero: primero }) : null
  const pii = detectarPII(txt)
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">¿Este mensaje es de verdad de Respaldo?</h1>
      <Regla compacta />
      <div className="tarjeta space-y-3">
        <label htmlFor="msg">Pega aquí el mensaje que te llegó</label>
        <textarea id="msg" rows={5} maxLength={1500} value={txt} onChange={e => setTxt(e.target.value)} placeholder="Copia y pega el mensaje completo" />
        <button className="text-sm underline" onClick={() => { setTxt(EJEMPLO); setPrimero(false) }}>Probar con un ejemplo (inventado)</button>
        <p className="font-semibold">¿Tú le escribiste primero?</p>
        <div className="grid grid-cols-2 gap-2">
          <button aria-pressed={primero === true} className={`boton ${primero === true ? '' : 'boton-sec'}`} onClick={() => setPrimero(true)}>Sí, yo escribí</button>
          <button aria-pressed={primero === false} className={`boton ${primero === false ? '' : 'boton-sec'}`} onClick={() => setPrimero(false)}>No, me escribieron</button>
        </div>
        <p className="text-xs text-neutral-600">Se revisa en tu teléfono con reglas fijas. El texto no se envía a ningún lado ni lo lee una inteligencia artificial.</p>
        {pii.length > 0 && <p className="text-sm text-rojo">Ojo: el mensaje trae {pii.join(', ')}. No lo reenvíes a nadie.</p>}
      </div>
      {r && (
        <div className={r.veredicto === 'fraude' ? 'alerta' : 'tarjeta'}>
          <p className="text-lg font-bold">
            {r.veredicto === 'fraude' && 'Es un fraude. Respaldo nunca haría esto.'}
            {r.veredicto === 'sospechoso' && 'Sospechoso. No abras enlaces ni contestes.'}
            {r.veredicto === 'sin_senales' && 'No encontramos señales, pero recuerda: Respaldo nunca te escribe primero.'}
          </p>
          {r.razones.length > 0 && <ul className="mt-1 list-disc pl-5">{r.razones.map(x => <li key={x}>{x}</li>)}</ul>}
          {r.veredicto !== 'sin_senales' && <p className="mt-2 text-sm">No contestes. Si ya diste un código o un dato, llama al número que viene atrás de tu tarjeta.</p>}
        </div>
      )}
    </div>
  )
}
