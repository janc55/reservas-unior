import * as admin from 'firebase-admin';

admin.initializeApp();

export { sendReservationNotification } from './triggers/reservationNotifications';
export { sendReminderNotifications } from './scheduled/sendReminders';
export { generateDailyReport } from './scheduled/dailyReport';
