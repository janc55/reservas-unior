import React, { useCallback, useEffect, useState } from 'react';
import {
  History,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  Users,
  Package,
  Filter,
} from 'lucide-react';
import { getAllReservations } from '../../services/adminService';
import { getEventTypeColor } from '../../services/publicAvailabilityService';
import { Reservation, ReservationStatus } from '../../types';

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

const EVENT_TYPES = ['Académico', 'Cultural', 'Administrativo', 'Externo'];

export const AdminHistoryPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | ''>('');
  const [filterDate, setFilterDate] = useState('');
  const [filterEventType, setFilterEventType] = useState('');

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: {
        status?: ReservationStatus;
        date?: string;
        eventType?: string;
      } = {};

      if (filterStatus) filters.status = filterStatus;
      if (filterDate) filters.date = filterDate;
      if (filterEventType) filters.eventType = filterEventType;

      const data = await getAllReservations(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      setReservations(data);
    } catch (err) {
      console.error('Error loading reservations history:', err);
      setError('No se pudo cargar el historial de reservas.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterDate, filterEventType]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const clearFilters = () => {
    setFilterStatus('');
    setFilterDate('');
    setFilterEventType('');
  };

  const hasFilters = filterStatus || filterDate || filterEventType;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Historial de Reservas
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Consulta completa de todas las solicitudes de reserva con filtros
          avanzados.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">Filtros</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as ReservationStatus | '')
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Tipo de Evento
            </label>
            <select
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="">Todos</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Cargando historial...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            Sin resultados
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {hasFilters
              ? 'No se encontraron reservas con los filtros aplicados.'
              : 'No hay reservas registradas en el sistema.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Resultados ({reservations.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {reservations.map((reservation) => (
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
                      <p className="text-xs text-slate-500 pt-1">
                        {reservation.additionalNotes}
                      </p>
                    )}

                    {reservation.adminNotes && (
                      <p
                        className={`text-xs pt-1 ${
                          reservation.status === 'rejected'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}
                      >
                        <span className="font-medium">
                          Nota administrativa:
                        </span>{' '}
                        {reservation.adminNotes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
