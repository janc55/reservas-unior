import React, { useCallback, useEffect, useState } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  Package,
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react';
import {
  getAdminMetrics,
  getPendingReservations,
  approveReservation,
  rejectReservation,
  AdminMetrics,
} from '../../services/adminService';
import { getEventTypeColor } from '../../services/publicAvailabilityService';
import { Reservation } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, pendingData] = await Promise.all([
        getAdminMetrics(),
        getPendingReservations(),
      ]);
      setMetrics(metricsData);
      setPendingReservations(pendingData);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('No se pudieron cargar los datos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (reservation: Reservation) => {
    if (actionLoading) return;

    const confirmed = window.confirm(
      `¿Aprobar la reserva "${reservation.eventName}"?\n\nFecha: ${reservation.date}\nHorario: ${reservation.startTime} - ${reservation.endTime}`
    );
    if (!confirmed) return;

    setActionLoading(reservation.id);
    setError(null);

    try {
      await approveReservation(reservation.id);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al aprobar la reserva.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reservation: Reservation) => {
    if (actionLoading) return;

    const reason = rejectReason[reservation.id] || '';
    if (!reason.trim()) {
      setError('Debes indicar un motivo para el rechazo.');
      return;
    }

    const confirmed = window.confirm(
      `¿Rechazar la reserva "${reservation.eventName}"?\n\nMotivo: ${reason}`
    );
    if (!confirmed) return;

    setActionLoading(reservation.id);
    setError(null);

    try {
      await rejectReservation(reservation.id, reason);
      setRejectReason((prev) => ({ ...prev, [reservation.id]: '' }));
      setShowRejectInput(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al rechazar la reserva.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Panel de Administración
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión y revisión de solicitudes de reservas del Auditorio UNIOR.
          </p>
        </div>
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
          <p className="text-sm text-slate-500">Cargando datos administrativos...</p>
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">
                  {metrics?.pending ?? 0}
                </span>
                <span className="block text-xs text-slate-500 font-medium">
                  Pendientes
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">
                  {metrics?.approved ?? 0}
                </span>
                <span className="block text-xs text-slate-500 font-medium">
                  Aprobadas
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">
                  {metrics?.rejected ?? 0}
                </span>
                <span className="block text-xs text-slate-500 font-medium">
                  Rechazadas
                </span>
              </div>
            </div>
          </div>

          {/* Pending Reservations List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Solicitudes Pendientes ({pendingReservations.length})
              </h2>
            </div>

            {pendingReservations.length === 0 ? (
              <div className="p-12 text-center">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800">
                  No hay solicitudes pendientes
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Todas las solicitudes han sido revisadas.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-4 md:p-6 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {reservation.eventName}
                          </h3>
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
                          <span className="font-medium">
                            {reservation.startTime} - {reservation.endTime}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-blue-700" />
                            {reservation.attendees} asistente(s)
                          </span>
                        </div>

                        <div className="text-xs text-slate-500">
                          <span className="font-medium text-slate-700">
                            Solicitante:
                          </span>{' '}
                          {reservation.userName} ({reservation.userEmail})
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
                          <button
                            onClick={() => toggleExpanded(reservation.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {expandedId === reservation.id ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                Ocultar notas
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                Ver notas adicionales
                              </>
                            )}
                          </button>
                        )}

                        {expandedId === reservation.id &&
                          reservation.additionalNotes && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                              {reservation.additionalNotes}
                            </p>
                          )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {actionLoading === reservation.id ? (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleApprove(reservation)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Aprobar
                            </button>

                            {showRejectInput === reservation.id ? (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="text"
                                  value={rejectReason[reservation.id] || ''}
                                  onChange={(e) =>
                                    setRejectReason((prev) => ({
                                      ...prev,
                                      [reservation.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Motivo del rechazo..."
                                  className="px-3 py-2 text-xs border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 w-48"
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleReject(reservation)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                                  >
                                    <Send className="w-3 h-3" />
                                    Enviar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowRejectInput(null);
                                      setRejectReason((prev) => ({
                                        ...prev,
                                        [reservation.id]: '',
                                      }));
                                    }}
                                    className="px-2 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowRejectInput(reservation.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Rechazar
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
