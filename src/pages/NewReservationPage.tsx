import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CalendarPlus,
  CheckCircle2,
  Loader2,
  Minus,
  Package,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAvailableEquipment } from '../services/equipmentService';
import { createReservation } from '../services/reservationService';
import { EquipmentItem, EventType, ReservedEquipment } from '../types';
import { OPERATIONAL_HOURS } from '../utils/reservationValidation';
import { getTodayDateString } from '../utils/timezone';

interface ReservationFormValues {
  eventName: string;
  eventType: EventType;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  additionalNotes: string;
}

const EVENT_TYPES: EventType[] = ['Académico', 'Cultural', 'Administrativo', 'Externo'];

export const NewReservationPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [equipmentCatalog, setEquipmentCatalog] = useState<EquipmentItem[]>([]);
  const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({});
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    defaultValues: {
      eventName: '',
      eventType: 'Académico',
      date: getTodayDateString(),
      startTime: '09:00',
      endTime: '10:00',
      attendees: 1,
      additionalNotes: '',
    },
  });

  useEffect(() => {
    const loadEquipment = async () => {
      setLoadingCatalog(true);
      try {
        const items = await getAvailableEquipment();
        setEquipmentCatalog(items);
      } catch (error) {
        console.error('Error loading equipment catalog:', error);
        setSubmitError('No se pudo cargar el catálogo de equipamiento.');
      } finally {
        setLoadingCatalog(false);
      }
    };

    loadEquipment();
  }, []);

  const selectedEquipment = useMemo<ReservedEquipment[]>(() => {
    return equipmentCatalog
      .filter((item) => (equipmentQuantities[item.id] ?? 0) > 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: equipmentQuantities[item.id],
      }));
  }, [equipmentCatalog, equipmentQuantities]);

  const updateEquipmentQuantity = (item: EquipmentItem, delta: number) => {
    setEquipmentQuantities((prev) => {
      const current = prev[item.id] ?? 0;
      const next = Math.max(0, Math.min(item.quantity, current + delta));
      return { ...prev, [item.id]: next };
    });
  };

  const onSubmit = async (values: ReservationFormValues) => {
    if (!currentUser || !userProfile) {
      setSubmitError('Debes iniciar sesión para crear una reserva.');
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await createReservation(
        {
          userId: currentUser.uid,
          userName: userProfile.displayName,
          userEmail: currentUser.email ?? userProfile.email,
          eventName: values.eventName,
          eventType: values.eventType,
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          attendees: Number(values.attendees),
          additionalNotes: values.additionalNotes,
          equipment: selectedEquipment,
        },
        equipmentCatalog
      );

      setSubmitSuccess(true);
      setTimeout(() => navigate('/mis-reservas'), 1500);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No se pudo enviar la solicitud. Intenta nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nueva Solicitud de Reserva</h1>
        <p className="text-xs text-slate-500 mt-1">
          Completa el formulario para enviar tu solicitud a revisión por la administración del auditorio.
        </p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span>Solicitud enviada correctamente. Redirigiendo a Mis Reservas...</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Datos del evento
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del evento *
            </label>
            <input
              type="text"
              {...register('eventName', { required: 'El nombre del evento es obligatorio.' })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="Ej. Conferencia de Medicina"
            />
            {errors.eventName && (
              <p className="text-xs text-red-600 mt-1">{errors.eventName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de evento *
              </label>
              <select
                {...register('eventType', { required: 'Selecciona un tipo de evento.' })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.eventType && (
                <p className="text-xs text-red-600 mt-1">{errors.eventType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de asistentes *
              </label>
              <input
                type="number"
                min={1}
                {...register('attendees', {
                  required: 'Indica el número de asistentes.',
                  min: { value: 1, message: 'Debe haber al menos 1 asistente.' },
                  valueAsNumber: true,
                })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              {errors.attendees && (
                <p className="text-xs text-red-600 mt-1">{errors.attendees.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              rows={3}
              {...register('additionalNotes')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
              placeholder="Detalles adicionales sobre el evento (opcional)"
            />
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Fecha y horario
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                min={getTodayDateString()}
                {...register('date', { required: 'Selecciona una fecha.' })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              {errors.date && (
                <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora inicio *
              </label>
              <input
                type="time"
                min={OPERATIONAL_HOURS.start}
                max={OPERATIONAL_HOURS.end}
                {...register('startTime', { required: 'Indica la hora de inicio.' })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              {errors.startTime && (
                <p className="text-xs text-red-600 mt-1">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hora fin *
              </label>
              <input
                type="time"
                min={OPERATIONAL_HOURS.start}
                max={OPERATIONAL_HOURS.end}
                {...register('endTime', { required: 'Indica la hora de fin.' })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              {errors.endTime && (
                <p className="text-xs text-red-600 mt-1">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Horario operativo: {OPERATIONAL_HOURS.start} - {OPERATIONAL_HOURS.end} (America/La_Paz).
            Las reservas no deben solaparse con reservas ya aprobadas.
          </p>
        </section>

        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Equipamiento
            </h2>
            <span className="text-[11px] text-slate-500">Opcional</span>
          </div>

          {loadingCatalog ? (
            <div className="flex items-center justify-center py-8 text-slate-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Cargando catálogo...
            </div>
          ) : equipmentCatalog.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No hay equipamiento disponible en este momento.
            </div>
          ) : (
            <div className="space-y-3">
              {equipmentCatalog.map((item) => {
                const quantity = equipmentQuantities[item.id] ?? 0;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/60"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      )}
                      <p className="text-[11px] text-blue-800 font-medium mt-1">
                        Disponible: {item.quantity} unidad{item.quantity !== 1 ? 'es' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => updateEquipmentQuantity(item, -1)}
                        disabled={quantity <= 0}
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                        aria-label={`Reducir ${item.name}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-slate-800">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateEquipmentQuantity(item, 1)}
                        disabled={quantity >= item.quantity}
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                        aria-label={`Aumentar ${item.name}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={submitting || submitSuccess}
          className="w-full py-3 px-4 unior-gradient text-white font-semibold text-sm rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enviando solicitud...</span>
            </>
          ) : (
            <>
              <CalendarPlus className="w-4 h-4 text-amber-300" />
              <span>Enviar Solicitud</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
