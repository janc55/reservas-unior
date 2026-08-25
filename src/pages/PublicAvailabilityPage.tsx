import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CalendarOff,
  Clock,
  Info,
} from 'lucide-react';
import {
  getApprovedReservationsForDate,
  calculateDayAvailability,
  DayAvailability,
  TimeSlot,
  formatTimeRange,
  getEventTypeColor,
} from '../services/publicAvailabilityService';

const TIMEZONE = 'America/La_Paz';

function formatDateForInput(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

function getTodayInTimezone(): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return new Date(parseInt(year!), parseInt(month!) - 1, parseInt(day!));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-BO', {
    timeZone: TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface TimeSlotCardProps {
  slot: TimeSlot;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ slot }) => {
  if (slot.isOccupied) {
    return (
      <div className="relative p-3 rounded-xl border-2 border-red-200 bg-red-50 transition-all duration-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-red-700">
            {formatTimeRange(slot.startTime, slot.endTime)}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-200 text-red-800 rounded-full">
            Ocupado
          </span>
        </div>
        {slot.eventName && (
          <div className="mt-1">
            <p className="text-xs font-medium text-red-600 truncate">
              {slot.eventName}
            </p>
            {slot.eventType && (
              <span
                className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${getEventTypeColor(
                  slot.eventType
                )}`}
              >
                {slot.eventType}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-100">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-700">
          {formatTimeRange(slot.startTime, slot.endTime)}
        </span>
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-200 text-emerald-800 rounded-full">
          Disponible
        </span>
      </div>
    </div>
  );
};

export const PublicAvailabilityPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatDateForInput(getTodayInTimezone())
  );
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const reservations = await getApprovedReservationsForDate(date);
      const dayAvailability = calculateDayAvailability(date, reservations);
      setAvailability(dayAvailability);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(
        'No se pudo cargar la disponibilidad. Por favor, intenta novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate, fetchAvailability]);

  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate + 'T00:00:00');
    const previousDay = addDays(currentDate, -1);
    const today = getTodayInTimezone();
    if (previousDay >= today) {
      setSelectedDate(formatDateForInput(previousDay));
    }
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate + 'T00:00:00');
    const nextDay = addDays(currentDate, 1);
    setSelectedDate(formatDateForInput(nextDay));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const today = formatDateForInput(getTodayInTimezone());
    if (newDate >= today) {
      setSelectedDate(newDate);
    }
  };

  const isToday = selectedDate === formatDateForInput(getTodayInTimezone());

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Banner Hero */}
      <div className="relative rounded-3xl unior-gradient text-white p-6 md:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 border border-amber-400/20 mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sistema Oficial UNIOR - Auditorio Principal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
            Consulta de Disponibilidad del Auditorio
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Verifica en tiempo real los horarios disponibles del auditorio
            institucional para planificar tus eventos académicos, culturales y
            administrativos.
          </p>
        </div>
      </div>

      {/* Selector de Fecha */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-700">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-sm">Seleccionar Fecha</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousDay}
              disabled={isToday}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Día anterior"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={formatDateForInput(getTodayInTimezone())}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              onClick={handleNextDay}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              aria-label="Día siguiente"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500 capitalize">
            {formatDisplayDate(selectedDate)}
          </p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Estado de Carga */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-slate-500">
              Cargando disponibilidad...
            </p>
          </div>
        )}

        {/* Estado de Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Error al cargar
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-md">
              {error}
            </p>
            <button
              onClick={() => fetchAvailability(selectedDate)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estado sin Reservas */}
        {!loading && !error && availability && availability.occupiedSlots === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <CalendarOff className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Sin reservas para esta fecha
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-md">
              El auditorio se encuentra completamente disponible para esta
              fecha. Puedes proceder a solicitar una reserva.
            </p>
          </div>
        )}

        {/* Rejilla de Horarios */}
        {!loading && !error && availability && availability.occupiedSlots > 0 && (
          <div className="p-4 md:p-6">
            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {availability.totalSlots}
                </p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {availability.availableSlots}
                </p>
                <p className="text-xs text-emerald-600">Disponibles</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {availability.occupiedSlots}
                </p>
                <p className="text-xs text-red-600">Ocupados</p>
              </div>
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300" />
                <span className="text-slate-600">Disponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-200 border border-red-300" />
                <span className="text-slate-600">Ocupado</span>
              </div>
            </div>

            {/* Lista de Horarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availability.slots.map((slot) => (
                <TimeSlotCard key={slot.startTime} slot={slot} />
              ))}
            </div>

            {/* Nota de Privacidad */}
            <div className="mt-6 flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Por privacidad, solo se muestran los horarios ocupados. Los
                datos personales de los solicitantes no son visibles en esta
                vista pública.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Horario Operativo */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 text-slate-700 mb-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-sm">Horario Operativo</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="px-3 py-1 bg-slate-100 rounded-lg font-medium">
            08:00
          </span>
          <span className="text-slate-400">a</span>
          <span className="px-3 py-1 bg-slate-100 rounded-lg font-medium">
            20:00
          </span>
          <span className="text-xs text-slate-500 ml-2">
            (Lunes a Viernes)
          </span>
        </div>
      </div>
    </div>
  );
};
