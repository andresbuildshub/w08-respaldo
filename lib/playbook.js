// The playbook: fixed, human-reviewed steps. Identical for everyone; nothing here depends on who she is.
// Every step names its source. Where a fact is our reading and not a quote, the step says so.

export const FUENTES = {
  condusef_spei: { nombre: 'CONDUSEF, alerta sobre fraudes con SPEI', url: 'https://www.infobae.com/mexico/2025/09/26/alerta-condusef-este-es-el-fraude-con-transferencias-spei-que-aumenta-en-mexico/' },
  condusef_portal: { nombre: 'CONDUSEF, Portal de Queja Electrónica', url: 'https://www.condusef.gob.mx/?p=contenido&idc=1338&idcat=1' },
  condusef_tel: { nombre: 'CONDUSEF, Centro de Atención Telefónica 55 5340 0999 (L–V 8 a 22 h, sáb 9 a 14 h)', url: 'https://www.condusef.gob.mx/' },
  denuncia_cdmx: { nombre: 'FGJCDMX, Denuncia Digital (necesita Llave CDMX)', url: 'https://denunciadigital.cdmx.gob.mx/' },
  cep: { nombre: 'Banxico, Comprobante Electrónico de Pago (CEP)', url: 'https://www.banxico.org.mx/cep/' },
  clabe: { nombre: 'Estructura de la CLABE: 3 dígitos de banco, 3 de plaza, 11 de cuenta, 1 verificador (librería clabe-validator)', url: 'https://github.com/center-key/clabe-validator' },
  wa_robada: { nombre: 'Ayuda de WhatsApp, "How to recover a compromised account"', url: 'https://faq.whatsapp.com/1131652977717250/' },
  wa_pin: { nombre: 'Ayuda de WhatsApp, misma página: si alguien activó la verificación en dos pasos y no tienes el PIN, espera 7 días', url: 'https://faq.whatsapp.com/1131652977717250/' },
  wa_epidemia: { nombre: 'El Imparcial, secuestro de cuentas de WhatsApp +650% en México (may-2026)', url: 'https://www.elimparcial.com/mexico/2026/05/06/el-secuestro-de-cuentas-de-whatsapp-escala-en-mexico-delincuentes-suplantan-identidad-para-solicitar-dinero-tras-interceptar-codigos-de-verificacion-en-pantallas-bloqueadas/' },
  sat_visor: { nombre: 'Expansión, ingresos no reconocidos en el SAT y robo de identidad (abr-2026)', url: 'https://expansion.mx/finanzas-personales/2026/04/07/ingresos-no-reconocidos-en-tu-declaracion-del-sat-podria-ser-robo-de-identidad' },
  prodecon: { nombre: 'PRODECON, asesoría gratuita al contribuyente', url: 'https://www.prodecon.gob.mx/' },
  buro: { nombre: 'Buró de Crédito, reporte de crédito especial', url: 'https://www.burodecredito.com.mx/' },
}

export const CATEGORIAS = {
  transferencia: {
    titulo: 'Le transferí dinero a alguien que se hizo pasar por un familiar o conocido',
    ayuda: 'Escoge esta si tú mandaste el dinero, aunque también le hayan robado el WhatsApp a tu familiar.',
    corto: 'Transferí a un impostor',
    verdad: 'Ya hiciste lo más urgente: avisar a tu banco. Ahora vamos paso por paso para que tu caso quede bien hecho y no tengas que ir dos veces al mismo lugar.',
    letraChica: 'Para que lo sepas: si la cuenta a la que transferiste no era de quien decía ser, CONDUSEF dice que ni tu banco ni el que recibió están obligados a devolver el dinero. Por eso conviene que tu banco actúe pronto y que todo quede por escrito.',
    pasos: [
      { id: 't-reporte', dia: 'Ahora', titulo: 'Reporta la operación a tu banco', porque: 'Tu banco es el único que puede pedir que detengan el dinero en la cuenta a la que llegó. Llama al número que viene atrás de tu tarjeta o usa "operación no reconocida" en la app. Pide un número de folio y anótalo.', fuente: 'condusef_spei' },
      { id: 't-clabe', dia: 'Hoy', titulo: 'Revisa a qué banco fue el dinero', porque: 'La cuenta de quien te robó casi siempre está en otro banco. Tu reclamación y tu denuncia deben decir qué banco la recibió. Escribe aquí la CLABE (los 18 números que vienen en tu comprobante): se revisa en tu teléfono y no se envía a ningún lado.', fuente: 'clabe', herramienta: 'clabe' },
      { id: 't-pruebas', dia: 'Hoy', titulo: 'Guarda tus pruebas antes de que se borren', porque: 'Toma capturas del chat completo (con el número y la hora) y descarga el comprobante oficial de la transferencia (se llama CEP) en la página de Banxico, o guarda el de tu app. La denuncia y la reclamación te las van a pedir, y el chat se puede borrar.', fuente: 'cep' },
      { id: 't-denuncia', dia: 'Día 1', titulo: 'Presenta tu denuncia por fraude', porque: 'En la CDMX se puede hacer en línea (Denuncia Digital; necesitas tu cuenta Llave CDMX, la del gobierno de la ciudad). En otros estados, en el Ministerio Público. Lleva tu escrito ya hecho, tu INE, el comprobante y las capturas, para ir una sola vez.', fuente: 'denuncia_cdmx', herramienta: 'documentos' },
      { id: 't-reclamacion', dia: 'Día 2', titulo: 'Deja tu reclamación por escrito en tu banco', porque: 'Una llamada no deja constancia. Entrega tu reclamación por escrito en la oficina de quejas de tu banco (se llama UNE) y pide que te sellen una copia con número de folio. Si después vas a CONDUSEF, te van a pedir ese folio.', fuente: 'condusef_portal', herramienta: 'documentos' },
      { id: 'rechazo-banco', dia: 'Día 7', titulo: '¿Tu banco rechazó tu reclamación? Ve a CONDUSEF', porque: 'Si te contestan "usted lo autorizó" o no te contestan, puedes presentar una queja en CONDUSEF por teléfono (55 5340 0999) o en su portal. Aquí te damos el texto ya armado. Si tu banco es el que paga a Respaldo, no te aconsejamos sobre esa disputa: te damos la queja y la contamos en público.', fuente: 'condusef_tel', herramienta: 'condusef' },
    ],
  },
  whatsapp: {
    titulo: 'Me robaron mi WhatsApp (o el de un familiar)',
    ayuda: 'Escoge esta si nadie mandó dinero, o para pasársela a quien le robaron la cuenta.',
    corto: 'WhatsApp robado',
    verdad: 'Si te escribe tu familiar porque su WhatsApp fue robado, reenvíale esta página. Él tiene que hacer los pasos en SU teléfono.',
    pasos: [
      { id: 'w-aviso', dia: 'Ahora', titulo: 'Avisa a tus contactos desde otro teléfono o por SMS', porque: 'El ladrón está pidiendo dinero a tus contactos ahora mismo. Un aviso corto evita la siguiente transferencia. Abajo está el texto para copiar.', fuente: 'wa_epidemia', herramienta: 'aviso' },
      { id: 'w-registro', dia: 'Ahora', titulo: 'Vuelve a registrar tu número en WhatsApp en tu teléfono', porque: 'Abre WhatsApp, pon tu número y escribe el código de 6 dígitos que llega por SMS a TU chip. Según la ayuda de WhatsApp, al poner ese código se cierra la sesión de cualquier otro teléfono, aunque te pida un PIN que no conoces. Ese código no se lo des a nadie, tampoco a nosotros.', fuente: 'wa_robada' },
      { id: 'w-pin', dia: 'Ahora', titulo: 'Si te pide un PIN que no conoces', porque: 'El ladrón activó la verificación en dos pasos. Tranquila: con el código de 6 dígitos el ladrón ya quedó fuera. Según WhatsApp, si no tienes el PIN, espera 7 días y vuelve a intentar. Mientras, avisa a tus contactos.', fuente: 'wa_pin' },
      { id: 'w-chip', dia: 'Hoy', titulo: 'Si tu chip dejó de funcionar, ve a tu compañía de teléfono', porque: 'Si no te llega el SMS, puede que hayan pasado tu número a otro chip. Solo tu compañía puede devolvértelo, y te va a pedir tu INE en persona.', fuente: 'wa_robada' },
      { id: 'w-2fa', dia: 'Hoy', titulo: 'Cuando la recuperes: activa la verificación en dos pasos con correo', porque: 'Es un ajuste gratis de dos minutos: Ajustes → Cuenta → Verificación en dos pasos. Ponle un PIN y un correo de recuperación. Es la medida que más protege contra el robo de cuenta.', fuente: 'wa_epidemia' },
      { id: 'w-familia', dia: 'Hoy', titulo: 'Si alguien de tu familia transfirió dinero', porque: 'Esa persona sigue el plan "Transferí a un impostor" con su banco. El dinero sale de SU cuenta, no de la tuya.', fuente: 'condusef_spei' },
    ],
  },
  sat: {
    titulo: 'Hay facturas o ingresos a mi nombre en el SAT que no son míos',
    corto: 'Facturas a mi nombre',
    verdad: 'Esto no se arregla en un día, pero sí tiene orden. Las instituciones son gratuitas; nadie te tiene que cobrar por "limpiar" tu RFC.',
    pasos: [
      { id: 's-visor', dia: 'Hoy', titulo: 'Revisa qué facturas no reconoces', porque: 'En el portal del SAT, en "Consulta de facturas" (emitidas y recibidas), puedes ver mes por mes qué se facturó con tu RFC. Descarga la lista: es tu prueba.', fuente: 'sat_visor' },
      { id: 's-ciec', dia: 'Hoy', titulo: 'Cambia tu contraseña del SAT y pregunta quién tiene tu e.firma', porque: 'Si alguien más tiene tu contraseña o tu e.firma (a veces el contador), cámbiala. No es una acusación: así también te proteges tú y protegemos a tu contador.', fuente: 'sat_visor' },
      { id: 's-denuncia', dia: 'Día 1', titulo: 'Denuncia por usurpación de identidad', porque: 'Con la denuncia puedes demostrar ante el SAT que hay una investigación abierta si te quieren cobrar o multar. Lleva la lista de facturas.', fuente: 'sat_visor', herramienta: 'documentos' },
      { id: 's-prodecon', dia: 'Día 2', titulo: 'Pide ayuda a PRODECON (gratis)', porque: 'PRODECON media entre tú y el SAT y tiene experiencia en facturas falsas. No te cobra.', fuente: 'prodecon' },
      { id: 's-buro', dia: 'Día 7', titulo: 'Revisa tu Buró de Crédito', porque: 'Si usaron tus datos para facturar, pudieron usarlos para pedir crédito. Puedes pedir tu reporte de crédito especial.', fuente: 'buro' },
    ],
  },
  tarjeta: {
    titulo: 'Un cargo con mi tarjeta que yo no hice',
    corto: 'Cargo no reconocido',
    verdad: 'Este caso es distinto a una transferencia: tú no autorizaste el cargo. Reclámalo como "no reconocido".',
    pasos: [
      { id: 'c-bloqueo', dia: 'Ahora', titulo: 'Bloquea tu tarjeta', porque: 'Desde la app o el número atrás de tu tarjeta. Así no pueden hacer más cargos.', fuente: 'condusef_portal' },
      { id: 'c-reclamo', dia: 'Hoy', titulo: 'Reclama el cargo como "no reconocido" y pide folio', porque: 'Pide número de folio y anótalo con la fecha. Revisa también los demás cargos del último mes.', fuente: 'condusef_portal', herramienta: 'documentos' },
      { id: 'rechazo-banco', dia: 'Día 7', titulo: '¿Te rechazaron el reclamo? Ve a CONDUSEF', porque: 'El Portal de Queja Electrónica de CONDUSEF recibe quejas por cargos no reconocidos en tarjetas. Aquí te damos el texto ya armado. Si tu banco es el que paga a Respaldo, no te aconsejamos sobre esa disputa: te damos la queja y la contamos en público.', fuente: 'condusef_portal', herramienta: 'condusef' },
    ],
  },
}

export const PASOS_VALIDOS = new Set(Object.values(CATEGORIAS).flatMap(c => c.pasos.map(p => p.id)))

export function paso(categoria, id) {
  return CATEGORIAS[categoria]?.pasos.find(p => p.id === id) || null
}

// Every (categoria, paso) pair the API accepts; used to catch steps that don't belong to their category.
export function pasoPertenece(categoria, id) {
  return Boolean(paso(categoria, id))
}
