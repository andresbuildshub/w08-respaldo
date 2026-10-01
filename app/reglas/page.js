import Regla from '../../components/Regla'

export const metadata = { title: 'Qué guardamos · Respaldo' }

const EJEMPLO = `{
  "codigo": "RSP-7KQ2MX",
  "categoria": "transferencia",
  "paso": "t-clabe",
  "estado": "hecho",
  "fecha": "2026-10-01"
}`

export default function Reglas() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Qué guardamos y qué nunca</h1>
      <Regla />
      <section className="tarjeta space-y-2">
        <h2 className="font-bold">Lo único que llega a nuestro servidor</h2>
        <p>Cuando marcas un paso como hecho, se guarda esto, y nada más:</p>
        <pre className="overflow-x-auto rounded-lg bg-arena p-3 text-sm">{EJEMPLO}</pre>
        <p className="text-sm">El código lo da tu banco (aquí es SIMULADO). Nosotros no sabemos de quién es: el banco ya tiene tus datos, nosotros no los necesitamos. El servidor rechaza cualquier otro campo, por ejemplo un nombre.</p>
      </section>
      <section className="tarjeta space-y-2">
        <h2 className="font-bold">Lo que se queda en tu teléfono</h2>
        <ul className="list-disc pl-5 text-[15px] leading-snug">
          <li>Qué pasos marcaste y la CLABE a la que transferiste (para revisar el banco).</li>
          <li>Tus papeles: se llenan e imprimen en tu navegador. Tu nombre y tu RFC no salen del teléfono.</li>
          <li>Tus recordatorios: un archivo de calendario que tú guardas.</li>
          <li>Puedes borrar todo con un botón en tu plan.</li>
        </ul>
      </section>
      <section className="tarjeta space-y-2">
        <h2 className="font-bold">Decisiones de diseño (y por qué)</h2>
        <ol className="list-decimal space-y-1 pl-5 text-[15px] leading-snug">
          <li><b>No hay buscador de "¿se filtró mi CURP?"</b>: la CURP se puede calcular con nombre, fecha y estado, así que ese buscador serviría a los extorsionadores para buscar a cualquiera. Con ~195 millones de registros robados (más que la población adulta), la respuesta para todos es "asume que sí".</li>
          <li><b>Nunca escribimos primero</b>, ni para darte seguimiento: cualquier mensaje "de Respaldo" se puede copiar. Por eso los recordatorios son de tu calendario.</li>
          <li><b>Te acompañamos, no te representamos</b>: si hiciéramos trámites por ti tendríamos que guardar tu identidad, y seríamos la siguiente filtración.</li>
          <li><b>La IA nunca lee lo que escribes</b>: quitar nombres de un texto libre en español no es confiable. La IA solo ayuda al operador a redactar los pasos fijos, y una persona aprueba cada texto antes de publicarlo.</li>
          <li><b>Si tu pelea es con el banco que nos paga</b>, no te aconsejamos sobre esa pelea: te damos tu queja de CONDUSEF lista y la contamos en público.</li>
          <li><b>Lo urgente no es nuestro</b>: dinero que se está moviendo → tu banco; amenazas → 911 / 089.</li>
        </ol>
      </section>
      <section className="tarjeta space-y-1 text-sm">
        <h2 className="font-bold">Seguridad técnica</h2>
        <p>Encabezados: Content-Security-Policy (solo este sitio), Referrer-Policy no-referrer, X-Frame-Options DENY, Permissions-Policy sin cámara, micrófono ni ubicación, HSTS. La CLABE se revisa con la librería abierta <a className="underline" href="https://github.com/center-key/clabe-validator" target="_blank" rel="noreferrer">clabe-validator</a> (MIT), dentro de tu navegador. El código de este proyecto es público.</p>
      </section>
    </div>
  )
}
