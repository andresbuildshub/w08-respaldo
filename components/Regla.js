// The rule she must read before she needs it. Shown on every screen of the case.
export default function Regla({ compacta = false }) {
  if (compacta) {
    return (
      <p className="regla text-sm">
        <b>Respaldo nunca te escribe primero</b> y nunca te pide tarjeta, NIP, códigos, contraseñas, transferencias ni instalar nada.
        Si alguien lo hace en nuestro nombre, <b>es un fraude</b>.
      </p>
    )
  }
  return (
    <div className="regla">
      <p className="font-bold">Antes de empezar, una regla:</p>
      <ul className="mt-1 list-disc pl-5 text-[15px] leading-snug">
        <li>Respaldo <b>nunca te escribe primero</b>: ni WhatsApp, ni llamada, ni SMS, ni correo.</li>
        <li>Nunca te pide <b>tarjeta, NIP, códigos, contraseñas, transferencias</b> ni que <b>instales</b> nada.</li>
        <li>Si alguien te escribe diciendo que es de Respaldo, <b>es un fraude</b>. <a className="underline" href="/es-real">Revisa un mensaje aquí</a>.</li>
      </ul>
    </div>
  )
}
