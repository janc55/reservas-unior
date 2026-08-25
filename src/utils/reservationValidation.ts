import { EquipmentItem, EventType, Reservation, ReservedEquipment } from '../types';
import { getTodayDateString } from './timezone';

export const OPERATIONAL_HOURS = {
  start: '08:00',
  end: '20:00',
  startMinutes: 8 * 60,
  endMinutes: 20 * 60,
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isValidTimeFormat(time: string): boolean {
  return TIME_PATTERN.test(time);
}

export function isValidDateFormat(date: string): boolean {
  if (!DATE_PATTERN.test(date)) {
    return false;
  }
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

export function isFutureOrTodayDate(date: string, today: string = getTodayDateString()): boolean {
  return date >= today;
}

export function isTimeRangeOverlapping(
  newStart: string,
  newEnd: string,
  existStart: string,
  existEnd: string
): boolean {
  const newStartMin = timeToMinutes(newStart);
  const newEndMin = timeToMinutes(newEnd);
  const existStartMin = timeToMinutes(existStart);
  const existEndMin = timeToMinutes(existEnd);

  return newStartMin < existEndMin && newEndMin > existStartMin;
}

export function isWithinOperationalHours(startTime: string, endTime: string): boolean {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  return (
    startMin >= OPERATIONAL_HOURS.startMinutes &&
    endMin <= OPERATIONAL_HOURS.endMinutes
  );
}

export interface ReservationInput {
  eventName: string;
  eventType: EventType;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  additionalNotes: string;
  equipment: ReservedEquipment[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateReservationInput(
  input: ReservationInput,
  approvedReservations: Pick<Reservation, 'startTime' | 'endTime' | 'eventName'>[],
  equipmentCatalog: EquipmentItem[]
): ValidationResult {
  const errors: string[] = [];

  if (!input.eventName.trim()) {
    errors.push('El nombre del evento es obligatorio.');
  }

  if (!input.eventType) {
    errors.push('Debes seleccionar un tipo de evento.');
  }

  if (!isValidDateFormat(input.date)) {
    errors.push('La fecha debe tener el formato YYYY-MM-DD.');
  } else if (!isFutureOrTodayDate(input.date)) {
    errors.push('No se pueden crear reservas en fechas pasadas.');
  }

  if (!isValidTimeFormat(input.startTime)) {
    errors.push('La hora de inicio debe tener el formato HH:MM (24h).');
  }

  if (!isValidTimeFormat(input.endTime)) {
    errors.push('La hora de fin debe tener el formato HH:MM (24h).');
  }

  if (
    isValidTimeFormat(input.startTime) &&
    isValidTimeFormat(input.endTime) &&
    timeToMinutes(input.startTime) >= timeToMinutes(input.endTime)
  ) {
    errors.push('La hora de inicio debe ser anterior a la hora de fin.');
  }

  if (
    isValidTimeFormat(input.startTime) &&
    isValidTimeFormat(input.endTime) &&
    !isWithinOperationalHours(input.startTime, input.endTime)
  ) {
    errors.push(
      `El horario debe estar dentro del rango operativo (${OPERATIONAL_HOURS.start} - ${OPERATIONAL_HOURS.end}).`
    );
  }

  if (!Number.isInteger(input.attendees) || input.attendees < 1) {
    errors.push('El número de asistentes debe ser al menos 1.');
  }

  for (const selected of input.equipment) {
    const catalogItem = equipmentCatalog.find((item) => item.id === selected.id);

    if (!catalogItem) {
      errors.push(`El equipamiento "${selected.name}" ya no está disponible.`);
      continue;
    }

    if (!catalogItem.available) {
      errors.push(`"${catalogItem.name}" no está disponible para reservas.`);
    }

    if (!Number.isInteger(selected.quantity) || selected.quantity < 1) {
      errors.push(`La cantidad de "${catalogItem.name}" debe ser al menos 1.`);
    } else if (selected.quantity > catalogItem.quantity) {
      errors.push(
        `La cantidad de "${catalogItem.name}" no puede superar ${catalogItem.quantity} unidades disponibles.`
      );
    }
  }

  if (isValidTimeFormat(input.startTime) && isValidTimeFormat(input.endTime)) {
    const conflict = approvedReservations.find((reservation) =>
      isTimeRangeOverlapping(
        input.startTime,
        input.endTime,
        reservation.startTime,
        reservation.endTime
      )
    );

    if (conflict) {
      errors.push(
        `El horario seleccionado se solapa con una reserva aprobada (${conflict.startTime} - ${conflict.endTime}).`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
