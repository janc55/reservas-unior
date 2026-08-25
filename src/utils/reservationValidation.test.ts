import { describe, expect, it } from 'vitest';
import {
  isFutureOrTodayDate,
  isTimeRangeOverlapping,
  isValidDateFormat,
  isValidTimeFormat,
  isWithinOperationalHours,
  validateReservationInput,
} from './reservationValidation';
import { EquipmentItem } from '../types';

const sampleEquipment: EquipmentItem[] = [
  {
    id: 'eq-1',
    name: 'Proyector',
    icon: 'Projector',
    available: true,
    quantity: 2,
    description: '',
  },
];

describe('Validación de horarios', () => {
  it('rechaza una reserva que se solapa con otra aprobada', () => {
    const overlaps = isTimeRangeOverlapping('10:30', '10:45', '10:00', '11:00');
    expect(overlaps).toBe(true);
  });

  it('permite una reserva en un horario libre (intervalos adyacentes)', () => {
    const adjacent = isTimeRangeOverlapping('11:00', '12:00', '10:00', '11:00');
    expect(adjacent).toBe(false);

    const freeSlot = isTimeRangeOverlapping('11:30', '12:30', '10:00', '11:00');
    expect(freeSlot).toBe(false);
  });

  it('rechaza una reserva cuya fecha ya pasó', () => {
    expect(isFutureOrTodayDate('2020-01-01', '2026-08-24')).toBe(false);
    expect(isFutureOrTodayDate('2026-08-24', '2026-08-24')).toBe(true);
    expect(isFutureOrTodayDate('2026-08-25', '2026-08-24')).toBe(true);
  });

  it('valida formatos de hora y fecha', () => {
    expect(isValidTimeFormat('09:30')).toBe(true);
    expect(isValidTimeFormat('25:00')).toBe(false);
    expect(isValidDateFormat('2026-08-24')).toBe(true);
    expect(isValidDateFormat('24-08-2026')).toBe(false);
  });

  it('valida horario operativo', () => {
    expect(isWithinOperationalHours('08:00', '12:00')).toBe(true);
    expect(isWithinOperationalHours('07:00', '12:00')).toBe(false);
    expect(isWithinOperationalHours('08:00', '21:00')).toBe(false);
  });

  it('rechaza inicio mayor o igual que fin', () => {
    const result = validateReservationInput(
      {
        eventName: 'Evento',
        eventType: 'Académico',
        date: '2026-12-01',
        startTime: '14:00',
        endTime: '13:00',
        attendees: 10,
        additionalNotes: '',
        equipment: [],
      },
      [],
      sampleEquipment
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('inicio'))).toBe(true);
  });

  it('rechaza cantidades de equipamiento inválidas', () => {
    const result = validateReservationInput(
      {
        eventName: 'Evento',
        eventType: 'Académico',
        date: '2026-12-01',
        startTime: '09:00',
        endTime: '10:00',
        attendees: 10,
        additionalNotes: '',
        equipment: [{ id: 'eq-1', name: 'Proyector', quantity: 5 }],
      },
      [],
      sampleEquipment
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('Proyector'))).toBe(true);
  });

  it('rechaza solapamiento en validación completa del formulario', () => {
    const result = validateReservationInput(
      {
        eventName: 'Nuevo evento',
        eventType: 'Cultural',
        date: '2026-12-01',
        startTime: '10:30',
        endTime: '11:30',
        attendees: 20,
        additionalNotes: '',
        equipment: [],
      },
      [{ startTime: '10:00', endTime: '11:00', eventName: 'Existente' }],
      sampleEquipment
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('solapa'))).toBe(true);
  });
});
