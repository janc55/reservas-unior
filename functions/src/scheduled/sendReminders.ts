import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEmail } from '../config/resendClient';
import { getReminderEmail } from '../config/emailTemplates';

const db = admin.firestore();

export const sendReminderNotifications = functions.pubsub
  .schedule('*/5 * * * *')
  .timeZone('America/La_Paz')
  .onRun(async () => {
    console.log('Running reminder notifications check...');

    try {
      const now = new Date();
      const boliviaTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/La_Paz' })
      );

      const today = boliviaTime.toISOString().split('T')[0];
      const currentTimeMinutes =
        boliviaTime.getHours() * 60 + boliviaTime.getMinutes();

      const reservationsRef = db.collection('reservations');
      const q = reservationsRef
        .where('status', '==', 'approved')
        .where('date', '==', today);

      const snapshot = await q.get();

      for (const doc of snapshot.docs) {
        const reservation = doc.data();
        const reservationId = doc.id;

        const [startHours, startMinutes] = reservation.startTime
          .split(':')
          .map(Number);
        const reservationStartMinutes = startHours * 60 + startMinutes;

        const timeUntilStart = reservationStartMinutes - currentTimeMinutes;

        if (timeUntilStart >= 15 && timeUntilStart <= 20) {
          if (reservation.notificationSent?.reminder) {
            console.log(`Reminder already sent for reservation ${reservationId}`);
            continue;
          }

          try {
            const userEmail = reservation.userEmail;
            if (!userEmail) {
              console.log(`No email for reservation ${reservationId}`);
              continue;
            }

            const emailData = getReminderEmail({
              eventName: reservation.eventName,
              date: reservation.date,
              startTime: reservation.startTime,
              endTime: reservation.endTime,
              userName: reservation.userName,
            });

            await sendEmail({
              to: userEmail,
              subject: emailData.subject,
              html: emailData.html,
            });

            await db.collection('reservations').doc(reservationId).update({
              'notificationSent.reminder': true,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`Reminder sent for reservation ${reservationId}`);
          } catch (error) {
            console.error(
              `Error sending reminder for reservation ${reservationId}:`,
              error
            );
          }
        }
      }

      console.log('Reminder notifications check completed');
    } catch (error) {
      console.error('Error in reminder notifications:', error);
    }
  });
