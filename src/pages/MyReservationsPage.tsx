import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  Clock,
  Loader2,
  Package,
  PlusCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cancelReservation, getUserReservations } from '../services/reservationService';
import { getEventTypeColor } from '../services/publicAvailabilityService';
import { Reservation, ReservationStatus } from '../types';

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

function canCancelReservation(status: ReservationStatus): boolean {
  return status === 'pending' || status === 'approved';
}

export const MyReservationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getUserReservations(currentUser.uid);
      setReservations(data);
    } catch (err) {
      console.error('Error loading reservations:', err);
      setError('No se pudieron cargar tus reservas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleCancel = async (reservation: Reservation) => {
    if (!currentUser || cancellingId) {
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmas la cancelación de "${reservation.eventName}"?`
    );
    if (!confirmed) {
      return;
    }

    setCancellingId(reservation.id);
    setError(null);

    try {
      await cancelReservation(reservation.id, currentUser.uid);
      await loadReservations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cancelar la reserva. Intenta nuevamente.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Reservas</h1>
          <p className="text-xs text-slate-500 mt-1">
            Historial y estado de tus solicitudes de reserva del auditorio.
          </p>
        </div>
        <Link
          to="/reservas/nueva"
          className="inline-flex items-center space-x-2 unior-gradient text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:opacity-95 transition self-start"
        >
          <PlusCircle className="w-4 h-4 text-amber-300" />
          <span>Solicitar Nueva Reserva</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Cargando tus reservas...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No tienes reservas activas</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Crea tu primera solicitud de reserva seleccionando fecha, hora y equipamiento.
          </p>
          <Link
            to="/reservas/nueva"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-xl hover:bg-blue-800 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva solicitud</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <article
              key={reservation.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {reservation.eventName}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${STATUS_STYLES[reservation.status]}`}
                    >
                      {STATUS_LABELS[reservation.status]}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getEventTypeColor(
                        reservation.eventType
                      )}`}
                    >
                      {reservation.eventType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-700" />
                      {reservation.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-700" />
                      {reservation.startTime} - {reservation.endTime}
                    </span>
                    <span>{reservation.attendees} asistente(s)</span>
                  </div>

                  {reservation.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {reservation.equipment.map((item) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700"
                        >
                          <Package className="w-3 h-3" />
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  )}

                  {reservation.additionalNotes && (
                    <p className="text-xs text-slate-500 pt-1">
                      {reservation.additionalNotes}
                    </p>
                  )}

                  {reservation.adminNotes && reservation.status === 'rejected' && (
                    <p className="text-xs text-red-600 pt-1">
                      Motivo: {reservation.adminNotes}
                    </p>
                  )}
                </div>

                {canCancelReservation(reservation.status) && (
                  <button
                    onClick={() => handleCancel(reservation)}
                    disabled={cancellingId === reservation.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition disabled:opacity-50 self-start"
                  >
                    {cancellingId === reservation.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    Cancelar
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
