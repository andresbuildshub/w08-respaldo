// Papers she prints. Pure functions: a form object in, plain text out. Runs only in her browser.
// These are MODELS with blanks, not legal advice; the screen says so.

const L = (n) => '_'.repeat(n)
const v = (x, n = 24) => (x && String(x).trim()) ? String(x).trim().slice(0, 200) : L(n)
const pesos = (m) => {
  const n = Number(String(m || '').replace(/[^\d.]/g, ''))
  return n > 0 ? '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' M.N.' : '$' + L(10)
}

export const TIPOS = {
  denuncia: 'Denuncia (Fiscalía / Ministerio Público)',
  reclamacion: 'Reclamación por escrito a tu banco (UNE)',
  condusef: 'Texto para tu queja en CONDUSEF',
}

function hechos(f) {
  if (f.categoria === 'sat') {
    return [
      `1. El ${v(f.fecha, 12)} me di cuenta de que en el portal del SAT aparecen facturas emitidas con mi RFC ${v(f.rfc, 13)} que yo no emití ni cobré.`,
      `2. No autoricé a nadie a facturar a mi nombre. Anexo la lista de facturas que no reconozco, descargada del portal del SAT.`,
    ]
  }
  if (f.categoria === 'tarjeta') {
    return [
      `1. El ${v(f.fecha, 12)} apareció en mi tarjeta del banco ${v(f.bancoPropio)} un cargo por ${pesos(f.monto)} que yo no realicé ni autoricé.`,
      `2. Reporté el cargo a mi banco ${f.folio ? `con número de folio ${f.folio}` : `con número de folio ${L(12)}`} y bloqueé la tarjeta.`,
    ]
  }
  return [
    `1. El ${v(f.fecha, 12)}, aproximadamente a las ${v(f.hora, 6)} horas, recibí por WhatsApp un mensaje desde el número de ${v(f.quien)}, pidiéndome dinero por una supuesta emergencia.`,
    `2. Creyendo que era esa persona, transferí ${pesos(f.monto)} por SPEI desde mi cuenta en ${v(f.bancoPropio)} a la CLABE ${v(f.clabe, 18)}${f.bancoDestino ? `, que corresponde a ${f.bancoDestino}` : ''}${f.rastreo ? `, con clave de rastreo ${f.rastreo}` : ''}.`,
    `3. Después supe que la cuenta de WhatsApp de esa persona había sido robada y que no era ella quien me escribía.`,
    `4. Reporté la operación a mi banco ${f.folio ? `con número de folio ${f.folio}` : `con número de folio ${L(12)}`}.`,
  ]
}

export function generarDocumento(tipo, f) {
  const nombre = v(f.nombre, 30)
  const hoy = v(f.hoy, 12)
  const h = hechos(f).join('\n\n')
  if (tipo === 'denuncia') {
    const delito = f.categoria === 'sat' ? 'usurpación de identidad y los que resulten' : 'fraude y los que resulten'
    return `${v(f.lugar, 20)}, a ${hoy}

C. AGENTE DEL MINISTERIO PÚBLICO EN TURNO
P R E S E N T E

${nombre}, por mi propio derecho, vengo a presentar DENUNCIA por hechos posiblemente constitutivos del delito de ${delito}, en contra de quien o quienes resulten responsables, con base en los siguientes

H E C H O S

${h}

P R U E B A S

- Capturas de pantalla de la conversación, con número y hora.
- ${f.categoria === 'sat' ? 'Lista de facturas no reconocidas descargada del SAT.' : 'Comprobante de la operación (CEP de Banxico o estado de cuenta).'}
- Copia de mi identificación oficial.

Por lo anterior, solicito que se inicie la investigación correspondiente${f.categoria === 'transferencia' ? ' y que se solicite a la institución que recibió los recursos la información de la cuenta destino' : ''}, y que se me entregue copia de esta denuncia.

A T E N T A M E N T E

${L(30)}
${nombre}`
  }
  if (tipo === 'reclamacion') {
    return `${v(f.lugar, 20)}, a ${hoy}

UNIDAD ESPECIALIZADA DE ATENCIÓN A USUARIOS (UNE)
${v(f.bancoPropio)}
P R E S E N T E

${nombre}, cliente de esta institución, presento RECLAMACIÓN formal por la siguiente operación:

${h}

Solicito:
1. Que se registre esta reclamación y se me entregue acuse con número de folio.
2. ${f.categoria === 'tarjeta' ? 'Que se investigue y se abone el cargo no reconocido.' : 'Que se investigue la operación y se solicite a la institución receptora la retención de los recursos, si aún es posible.'}
3. Que se me responda por escrito.

Anexo copia de mi identificación${f.categoria === 'sat' ? '' : ', el comprobante de la operación'} y las capturas de pantalla.

A T E N T A M E N T E

${L(30)}
${nombre}`
  }
  // condusef: text to paste into the portal or read on the phone
  return `QUEJA ANTE CONDUSEF — texto para el Portal de Queja Electrónica o para leer por teléfono (55 5340 0999)

Institución: ${v(f.bancoPropio)}
Producto: ${f.categoria === 'tarjeta' ? 'Tarjeta' : 'Cuenta'}
Monto: ${pesos(f.monto)}

${h}

Presenté mi reclamación por escrito a la UNE de ${v(f.bancoPropio)} con folio ${v(f.folioUNE, 12)} el ${v(f.fechaUNE, 12)}. ${f.respuesta ? `El banco respondió: "${String(f.respuesta).slice(0, 200)}".` : 'No he recibido respuesta, o la respuesta fue negativa.'}

Solicito la intervención de CONDUSEF para que la institución revise mi caso.`
}
