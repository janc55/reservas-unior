interface ReservationEmailData {
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  userName: string;
  adminNotes?: string;
}

const emailHeader = `
  <tr>
    <td style="background: linear-gradient(135deg, #0f2b5c 0%, #1e3a5f 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">UNIOR Auditorio</h1>
      <p style="color: #d4af37; margin: 5px 0 0 0; font-size: 12px;">Sistema de Reservas</p>
    </td>
  </tr>
`;

const emailFooter = `
  <tr>
    <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; margin: 0; font-size: 12px;">
        UNIOR - Sistema de Reservas del Auditorio
      </p>
    </td>
  </tr>
`;

function wrapEmail(body: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            ${emailHeader}
            ${body}
            ${emailFooter}
          </table>
        </td></tr>
      </table>
    </body></html>
  `;
}

function reservationTable(reservation: ReservationEmailData): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;margin:30px 0;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Evento:</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:bold;text-align:right;">${reservation.eventName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Fecha:</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:bold;text-align:right;">${reservation.date}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Horario:</td><td style="padding:8px 0;color:#111827;font-size:14px;font-weight:bold;text-align:right;">${reservation.startTime} - ${reservation.endTime}</td></tr>
        </table>
      </td></tr>
    </table>
  `;
}

export function getReservationStatusEmail(
  status: 'pending' | 'approved' | 'rejected',
  reservation: ReservationEmailData
): { subject: string; html: string } {
  const cfg = {
    pending: {
      subject: `Solicitud de reserva recibida: ${reservation.eventName}`,
      color: '#f59e0b',
      title: 'Solicitud Recibida',
      msg: 'Tu solicitud de reserva ha sido recibida y esta pendiente de revision por la administracion.',
    },
    approved: {
      subject: `Reserva aprobada: ${reservation.eventName}`,
      color: '#10b981',
      title: 'Reserva Aprobada',
      msg: 'Tu solicitud de reserva ha sido aprobada! El auditorio esta reservado para tu evento.',
    },
    rejected: {
      subject: `Reserva rechazada: ${reservation.eventName}`,
      color: '#ef4444',
      title: 'Reserva Rechazada',
      msg: 'Lo sentimos, tu solicitud de reserva no ha sido aprobada.',
    },
  };

  const c = cfg[status];
  const notesBlock = reservation.adminNotes
    ? `<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:0 8px 8px 0;"><p style="color:#92400e;margin:0;font-size:14px;"><strong>Nota administrativa:</strong> ${reservation.adminNotes}</p></div>`
    : '';

  const body = `
    <tr><td style="padding:40px;">
      <div style="text-align:center;margin-bottom:30px;">
        <div style="display:inline-block;background:${c.color}20;color:${c.color};padding:10px 20px;border-radius:20px;font-weight:bold;font-size:14px;">${c.title}</div>
      </div>
      <p style="color:#374151;font-size:16px;line-height:1.6;text-align:center;">Hola <strong>${reservation.userName}</strong>,</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;text-align:center;">${c.msg}</p>
      ${reservationTable(reservation)}
      ${notesBlock}
      <p style="color:#6b7280;font-size:14px;text-align:center;margin-top:30px;">Si tienes alguna consulta, contacta a la administracion del auditorio.</p>
    </td></tr>
  `;

  return { subject: c.subject, html: wrapEmail(body) };
}

export function getReminderEmail(reservation: ReservationEmailData): { subject: string; html: string } {
  const subject = `Recordatorio: Tu evento "${reservation.eventName}" comienza pronto`;

  const body = `
    <tr><td style="padding:40px;">
      <div style="text-align:center;margin-bottom:30px;">
        <div style="display:inline-block;background:#3b82f620;color:#3b82f6;padding:10px 20px;border-radius:20px;font-weight:bold;font-size:14px;">Recordatorio</div>
      </div>
      <p style="color:#374151;font-size:16px;line-height:1.6;text-align:center;">Hola <strong>${reservation.userName}</strong>,</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;text-align:center;">Tu evento programado en el auditorio comenzara en aproximadamente <strong>15-20 minutos</strong>.</p>
      ${reservationTable(reservation)}
      <p style="color:#6b7280;font-size:14px;text-align:center;">Por favor, asegurate de estar preparado para tu evento.</p>
    </td></tr>
  `;

  return { subject, html: wrapEmail(body) };
}

export function getDailyReportEmail(reportData: {
  date: string;
  reservations: Array<{
    eventName: string;
    startTime: string;
    endTime: string;
    userName: string;
    eventType: string;
  }>;
}): { subject: string; html: string } {
  const subject = `Reporte Diario de Reservas - ${reportData.date}`;

  const rows = reportData.reservations
    .map(
      (r) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;">${r.eventName}</td>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;">${r.eventType}</td>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;">${r.startTime} - ${r.endTime}</td>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;">${r.userName}</td>
      </tr>`
    )
    .join('');

  const tableBlock =
    reportData.reservations.length > 0
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <thead><tr style="background:#f9fafb;">
            <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Evento</th>
            <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Tipo</th>
            <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Horario</th>
            <th style="padding:12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Solicitante</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>`
      : `<div style="background:#f9fafb;padding:40px;text-align:center;border-radius:8px;"><p style="color:#6b7280;margin:0;">No hay eventos programados para esta fecha.</p></div>`;

  const body = `
    <tr><td style="padding:40px;">
      <p style="color:#374151;font-size:16px;line-height:1.6;"><strong>Fecha del reporte:</strong> ${reportData.date}</p>
      <p style="color:#374151;font-size:16px;line-height:1.6;"><strong>Total de eventos programados:</strong> ${reportData.reservations.length}</p>
      ${tableBlock}
      <p style="color:#6b7280;font-size:14px;text-align:center;margin-top:30px;">Este es un reporte automatico generado por el sistema de reservas.</p>
    </td></tr>
  `;

  return { subject, html: wrapEmail(body) };
}
