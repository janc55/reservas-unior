import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  EquipmentItem,
  EventType,
  Reservation,
  ReservationStatus,
  ReservedEquipment,
} from '../types';
import { getApprovedReservationsForDate } from './publicAvailabilityService';
import { ReservationInput, validateReservationInput } from '../utils/reservationValidation';

export interface CreateReservationPayload {
  userId: string;
  userName: string;
  userEmail: string;
  eventName: string;
  eventType: EventType;
  date: string;
  startTime: string;
  endTime: string;
  equipment: ReservedEquipment[];
  attendees: number;
  additionalNotes: string;
}

function mapReservationDoc(id: string, data: Record<string, unknown>): Reservation {
  return {
    id,
    userId: String(data.userId ?? ''),
    userName: String(data.userName ?? ''),
    userEmail: String(data.userEmail ?? ''),
    eventName: String(data.eventName ?? ''),
    eventType: data.eventType as EventType,
    date: String(data.date ?? ''),
    startTime: String(data.startTime ?? ''),
    endTime: String(data.endTime ?? ''),
    equipment: (data.equipment as ReservedEquipment[]) ?? [],
    attendees: Number(data.attendees ?? 0),
    additionalNotes: String(data.additionalNotes ?? ''),
    status: data.status as ReservationStatus,
    adminNotes: data.adminNotes ? String(data.adminNotes) : undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    approvedAt: data.approvedAt ?? null,
    rejectedAt: data.rejectedAt ?? null,
    notificationSent: (data.notificationSent as Reservation['notificationSent']) ?? {
      confirmation: false,
      reminder: false,
      dailyReport: false,
    },
  };
}

export async function createReservation(
  payload: CreateReservationPayload,
  equipmentCatalog: EquipmentItem[]
): Promise<string> {
  const input: ReservationInput = {
    eventName: payload.eventName,
    eventType: payload.eventType,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    attendees: payload.attendees,
    additionalNotes: payload.additionalNotes,
    equipment: payload.equipment,
  };

  const approvedReservations = await getApprovedReservationsForDate(payload.date);
  const validation = validateReservationInput(input, approvedReservations, equipmentCatalog);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const docRef = await addDoc(collection(db, 'reservations'), {
    userId: payload.userId,
    userName: payload.userName,
    userEmail: payload.userEmail,
    eventName: payload.eventName.trim(),
    eventType: payload.eventType,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    equipment: payload.equipment,
    attendees: payload.attendees,
    additionalNotes: payload.additionalNotes.trim(),
    status: 'pending',
    adminNotes: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    approvedAt: null,
    rejectedAt: null,
    notificationSent: {
      confirmation: false,
      reminder: false,
      dailyReport: false,
    },
  });

  return docRef.id;
}

export async function getUserReservations(userId: string): Promise<Reservation[]> {
  const reservationsRef = collection(db, 'reservations');
  const q = query(reservationsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((item) => mapReservationDoc(item.id, item.data()))
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      return b.startTime.localeCompare(a.startTime);
    });
}

export async function cancelReservation(
  reservationId: string,
  userId: string
): Promise<void> {
  const reservationRef = doc(db, 'reservations', reservationId);
  const snapshot = await getDoc(reservationRef);

  if (!snapshot.exists()) {
    throw new Error('La reserva no existe.');
  }

  const reservation = mapReservationDoc(snapshot.id, snapshot.data());

  if (reservation.userId !== userId) {
    throw new Error('No tienes permiso para cancelar esta reserva.');
  }

  if (reservation.status !== 'pending' && reservation.status !== 'approved') {
    throw new Error('Solo puedes cancelar reservas pendientes o aprobadas.');
  }

  await updateDoc(reservationRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
}
