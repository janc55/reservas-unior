import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendEmail } from '../config/resendClient';
import { getReservationStatusEmail } from '../config/emailTemplates';

const db = admin.firestore();

export const sendReservationNotification = functions.firestore
  .document('reservations/{reservationId}')
  .onWrite(async (change, context) => {
    const reservationId = context.params.reservationId;
    const before = change.before.data();
    const after = change.after.data();

    if (!after) {
      console.log('Document deleted, skipping notification');
      return;
    }

    const status = after.status as string;
    const previousStatus = before?.status as string;

    if (status === previousStatus) {
      console.log('Status unchanged, skipping notification');
      return;
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      console.log('Status not relevant for notification:', status);
      return;
    }

    try {
      const userEmail = after.userEmail;
      if (!userEmail) {
        console.log('No user email found, skipping notification');
        return;
      }

      const reservation = {
        eventName: after.eventName,
        date: after.date,
        startTime: after.startTime,
        endTime: after.endTime,
        userName: after.userName,
        adminNotes: after.adminNotes,
      };

      const { subject, html } = getReservationStatusEmail(
        status as 'pending' | 'approved' | 'rejected',
        reservation
      );

      await sendEmail({
        to: userEmail,
        subject,
        html,
      });

      console.log(`Notification sent for reservation ${reservationId} with status ${status}`);

      const updateData: Record<string, unknown> = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (status === 'approved') {
        updateData.approvedAt = admin.firestore.FieldValue.serverTimestamp();
      } else if (status === 'rejected') {
        updateData.rejectedAt = admin.firestore.FieldValue.serverTimestamp();
      }

      await db.collection('reservations').doc(reservationId).update(updateData);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });
