import twilio from "twilio";

export async function makeAlarmCall(
  accountSid: string,
  authToken: string,
  fromNumber: string,
  toNumber: string,
  zoneNumber: number,
  zoneName: string
): Promise<void> {
  const client = twilio(accountSid, authToken);

  const message = `
    Alerta de seguridad. Sistema C D T Secure.
    Se activó la zona ${zoneNumber}, ${zoneName}.
    Por favor revise su propiedad.
    Repito: se activó la zona ${zoneNumber}, ${zoneName}.
  `.trim().replace(/\s+/g, " ");

  const twiml = `<Response>
    <Say language="es-MX">${message}</Say>
    <Pause length="1"/>
    <Say language="es-MX">${message}</Say>
  </Response>`;

  await client.calls.create({
    twiml,
    to: toNumber,
    from: fromNumber,
  });
}

export async function makeTestCall(
  accountSid: string,
  authToken: string,
  fromNumber: string,
  toNumber: string,
  contactName: string
): Promise<void> {
  const client = twilio(accountSid, authToken);

  const twiml = `<Response>
    <Say language="es-MX">
      Mensaje de prueba del sistema C D T Secure.
      Las llamadas de alerta están configuradas correctamente para ${contactName}.
    </Say>
  </Response>`;

  await client.calls.create({
    twiml,
    to: toNumber,
    from: fromNumber,
  });
}
