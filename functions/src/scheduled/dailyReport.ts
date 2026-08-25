import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import PDFDocument from 'pdfkit';
import { sendEmail } from '../config/resendClient';
import { getDailyReportEmail } from '../config/emailTemplates';

const db = admin.firestore();
const bucket = admin.storage().bucket();

interface ReservationData {
  id: string;
  eventName: string;
  eventType: string;
  startTime: string;
  endTime: string;
  userName: string;
  userEmail: string;
  attendees: number;
  equipment: Array<{ name: string; quantity: number }>;
}

export const generateDailyReport = functions.pubsub
  .schedule('0 7 * * *')
  .timeZone('America/La_Paz')
  .onRun(async () => {
    console.log('Generating daily report...');

    try {
      const now = new Date();
      const boliviaTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/La_Paz' })
      );

      const today = boliviaTime.toISOString().split('T')[0];

      const reservationsRef = db.collection('reservations');
      const q = reservationsRef
        .where('status', '==', 'approved')
        .where('date', '==', today);

      const snapshot = await q.get();

      const reservations: ReservationData[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          eventName: data.eventName,
          eventType: data.eventType,
          startTime: data.startTime,
          endTime: data.endTime,
          userName: data.userName,
          userEmail: data.userEmail,
          attendees: data.attendees,
          equipment: data.equipment || [],
        };
      });

      reservations.sort((a, b) => a.startTime.localeCompare(b.startTime));

      console.log(`Found ${reservations.length} approved reservations for ${today}`);

      const pdfBuffer = await generatePDF(today, reservations);

      const filePath = `reports/${today}.pdf`;
      const file = bucket.file(filePath);

      await file.save(pdfBuffer, {
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            generatedAt: new Date().toISOString(),
            reservationCount: reservations.length.toString(),
          },
        },
      });

      console.log(`PDF saved to ${filePath}`);

      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '2030-01-01',
      });

      const adminEmails = functions.config().admin?.emails?.split(',') || [];

      if (adminEmails.length > 0) {
        const emailData = getDailyReportEmail({
          date: today,
          reservations: reservations.map((r) => ({
            eventName: r.eventName,
            startTime: r.startTime,
            endTime: r.endTime,
            userName: r.userName,
            eventType: r.eventType,
          })),
        });

        await sendEmail({
          to: adminEmails,
          subject: emailData.subject,
          html: emailData.html,
          attachments: [
            {
              filename: `reporte-${today}.pdf`,
              content: pdfBuffer.toString('base64'),
            },
          ],
        });

        console.log('Daily report email sent to admins');
      }

      await db.collection('dailyReports').doc(today).set({
        date: today,
        reservations: reservations.map((r) => r.id),
        pdfUrl: url,
        sentTo: adminEmails,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Daily report completed successfully');
    } catch (error) {
      console.error('Error generating daily report:', error);
    }
  });

function generatePDF(
  date: string,
  reservations: ReservationData[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc
      .fontSize(20)
      .fillColor('#0f2b5c')
      .text('UNIOR Auditorio', { align: 'center' })
      .fontSize(12)
      .fillColor('#6b7280')
      .text('Reporte Diario de Reservas', { align: 'center' })
      .moveDown();

    doc
      .fontSize(14)
      .fillColor('#111827')
      .text(`Fecha: ${date}`, { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .fillColor('#374151')
      .text(`Total de eventos: ${reservations.length}`)
      .moveDown();

    if (reservations.length === 0) {
      doc
        .fontSize(12)
        .fillColor('#6b7280')
        .text('No hay eventos programados para esta fecha.', { align: 'center' });
    } else {
      doc
        .fontSize(14)
        .fillColor('#0f2b5c')
        .text('Detalle de Eventos')
        .moveDown(0.5);

      reservations.forEach((reservation, index) => {
        doc
          .fontSize(11)
          .fillColor('#111827')
          .text(`${index + 1}. ${reservation.eventName}`)
          .fontSize(10)
          .fillColor('#6b7280')
          .text(`   Tipo: ${reservation.eventType}`)
          .text(`   Horario: ${reservation.startTime} - ${reservation.endTime}`)
          .text(`   Solicitante: ${reservation.userName}`)
          .text(`   Asistentes: ${reservation.attendees}`)
          .moveDown(0.5);

        if (reservation.equipment.length > 0) {
          doc
            .fontSize(9)
            .fillColor('#4b5563')
            .text(
              `   Equipamiento: ${reservation.equipment
                .map((e) => `${e.name} x${e.quantity}`)
                .join(', ')}`
            );
          doc.moveDown(0.5);
        }

        if (index < reservations.length - 1) {
          doc
            .moveDown(0.5)
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .strokeColor('#e5e7eb')
            .stroke()
            .moveDown(0.5);
        }
      });
    }

    doc
      .moveDown(2)
      .fontSize(8)
      .fillColor('#9ca3af')
      .text(
        `Generado automaticamente el ${new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}`,
        { align: 'center' }
      );

    doc.end();
  });
}
