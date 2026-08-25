import React, { useEffect, useState } from 'react';
import {
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { getPublicEquipmentCatalog } from '../services/equipmentService';
import { EquipmentItem } from '../types';

export const EquipmentCatalogPage: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEquipment = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await getPublicEquipmentCatalog();
        setEquipment(items);
      } catch (err) {
        console.error('Error loading equipment catalog:', err);
        setError('No se pudo cargar el catálogo de equipamiento.');
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl unior-gradient text-white p-6 md:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 border border-amber-400/20 mb-4">
            <Package className="w-3.5 h-3.5" />
            <span>Equipamiento Disponible</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
            Catálogo de Equipamiento del Auditorio
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Conoce el equipamiento disponible para tus eventos. Puedes
            seleccionarlo al momento de crear tu solicitud de reserva.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-slate-500">Cargando catálogo...</p>
          </div>
        )}

        {/* Error State */}
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
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && equipment.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Sin equipamiento disponible
            </h3>
            <p className="text-sm text-slate-500 text-center max-w-md">
              Actualmente no hay equipamiento disponible para reservas. Consulta
              más tarde o contacta a la administración.
            </p>
          </div>
        )}

        {/* Equipment Grid */}
        {!loading && !error && equipment.length > 0 && (
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.map((item) => (
                <div
                  key={item.id}
                  className="relative p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.available
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {item.available ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Disponible
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          No disponible
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    {item.name}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                      {item.quantity} unidad{item.quantity !== 1 ? 'es' : ''}
                    </span>
                    <span className="text-slate-400">disponible(s)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Note */}
            <div className="mt-6 flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <Package className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                La disponibilidad final del equipamiento se verifica al momento
                de crear la reserva. El catálogo muestra los items actualmente
                registrados en el sistema.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
