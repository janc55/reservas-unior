import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Reservation } from '../types';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isOccupied: boolean;
  eventName?: string;
  eventType?: string;
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
}

const OPERATIONAL_HOURS = {
  start: 8,
  end: 20,
};

const HOURS_INCREMENT = 1;

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = OPERATIONAL_HOURS.start; hour < OPERATIONAL_HOURS.end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

import { isTimeRangeOverlapping } from '../utils/reservationValidation';

export async function getApprovedReservationsForDate(
  date: string
): Promise<Reservation[]> {
  try {
    const reservationsRef = collection(db, 'reservations');
    const q = query(
      reservationsRef,
      where('date', '==', date),
      where('status', '==', 'approved')
    );

    const querySnapshot = await getDocs(q);
    const reservations: Reservation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        eventName: data.eventName,
        eventType: data.eventType,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        equipment: data.equipment,
        attendees: data.attendees,
        additionalNotes: data.additionalNotes,
        status: data.status,
        adminNotes: data.adminNotes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        approvedAt: data.approvedAt,
        rejectedAt: data.rejectedAt,
        notificationSent: data.notificationSent,
      });
    });

    return reservations;
  } catch (error) {
    console.error('Error fetching approved reservations:', error);
    throw error;
  }
}

export function calculateDayAvailability(
  date: string,
  reservations: Reservation[]
): DayAvailability {
  const timeSlots = generateTimeSlots();
  const slots: TimeSlot[] = [];

  timeSlots.forEach((slotTime) => {
    const slotEndHour = parseInt(slotTime.split(':')[0]) + HOURS_INCREMENT;
    const slotEnd = `${slotEndHour.toString().padStart(2, '0')}:00`;

    let isOccupied = false;
    let occupyingReservation: Reservation | null = null;

    for (const reservation of reservations) {
      if (
        isTimeRangeOverlapping(
          slotTime,
          slotEnd,
          reservation.startTime,
          reservation.endTime
        )
      ) {
        isOccupied = true;
        occupyingReservation = reservation;
        break;
      }
    }

    slots.push({
      startTime: slotTime,
      endTime: slotEnd,
      isOccupied,
      eventName: occupyingReservation?.eventName,
      eventType: occupyingReservation?.eventType,
    });
  });

  const occupiedSlots = slots.filter((slot) => slot.isOccupied).length;

  return {
    date,
    slots,
    totalSlots: slots.length,
    occupiedSlots,
    availableSlots: slots.length - occupiedSlots,
  };
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} - ${end}`;
}

export function getEventTypeColor(eventType: string): string {
  const colors: Record<string, string> = {
    Académico: 'bg-blue-100 border-blue-300 text-blue-800',
    Cultural: 'bg-purple-100 border-purple-300 text-purple-800',
    Administrativo: 'bg-amber-100 border-amber-300 text-amber-800',
    Externo: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  };
  return colors[eventType] || 'bg-slate-100 border-slate-300 text-slate-800';
}
