import Regla from '../components/Regla'
import EntrarDemo from './EntrarDemo'

export default function Home() {
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-bold leading-tight">Lo que sigue después del fraude, paso por paso.</h1>
        <p className="mt-2 text-[17px] leading-snug">
          Te robaron por WhatsApp, te hicieron un cargo, o aparecen facturas a tu nombre. Respaldo te dice <b>qué hacer, en qué orden y con qué papeles</b>,
          para que vayas una sola vez a cada lugar. <b>Tus datos no salen de tu teléfono.</b>
        </p>
      </section>
      <Regla />
      <section className="tarjeta space-y-3">
        <p className="text-sm"><span className="etiqueta">SIMULADO</span> En la vida real llegas aquí desde la app o la línea de fraudes de <b>tu banco</b>, con un código de caso. Ese enlace todavía no existe con ningún banco: este botón lo imita.</p>
        <EntrarDemo />
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="tarjeta">
          <h2 className="font-bold">Lo que sí hace</h2>
          <ul className="mt-1 list-disc pl-5 text-sm leading-snug">
            <li>Un plan de 7 días según lo que te pasó.</li>
            <li>Revisa a qué banco fue tu dinero, en tu teléfono.</li>
            <li>Te arma tu denuncia y tu reclamación para imprimir.</li>
            <li>Pone recordatorios en <b>tu</b> calendario.</li>
          </ul>
        </div>
        <div className="tarjeta">
          <h2 className="font-bold">Lo que nunca hace</h2>
          <ul className="mt-1 list-disc pl-5 text-sm leading-snug">
            <li>Guardar tu nombre, CURP, RFC, INE o teléfono.</li>
            <li>Escribirte primero.</li>
            <li>Decirte si "tu CURP se filtró" (con 195 millones de registros robados, asume que sí).</li>
            <li>Hacer trámites por ti: tú firmas, tú presentas.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
