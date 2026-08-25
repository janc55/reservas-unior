import React, { useCallback, useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
} from 'lucide-react';
import {
  getEquipmentCatalog,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from '../../services/adminService';
import { EquipmentItem } from '../../types';

interface EquipmentFormValues {
  name: string;
  description: string;
  quantity: number;
  available: boolean;
}

const defaultFormValues: EquipmentFormValues = {
  name: '',
  description: '',
  quantity: 1,
  available: true,
};

export const AdminEquipmentPage: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<EquipmentFormValues>(defaultFormValues);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getEquipmentCatalog();
      setEquipment(items);
    } catch (err) {
      console.error('Error loading equipment:', err);
      setError('No se pudo cargar el catálogo de equipamiento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const resetForm = () => {
    setFormValues(defaultFormValues);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (item: EquipmentItem) => {
    setEditingId(item.id);
    setFormValues({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      available: item.available,
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.name.trim()) {
      setError('El nombre del equipamiento es obligatorio.');
      return;
    }

    if (formValues.quantity < 0) {
      setError('La cantidad no puede ser negativa.');
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      if (editingId) {
        await updateEquipment(editingId, {
          name: formValues.name,
          description: formValues.description,
          quantity: formValues.quantity,
          available: formValues.available,
        });
      } else {
        await createEquipment({
          name: formValues.name,
          icon: 'Package',
          description: formValues.description,
          quantity: formValues.quantity,
          available: formValues.available,
        });
      }

      resetForm();
      await loadEquipment();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al guardar el equipamiento.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (item: EquipmentItem) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      `¿Eliminar "${item.name}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setError(null);

    try {
      await deleteEquipment(item.id);
      await loadEquipment();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al eliminar el equipamiento.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (item: EquipmentItem) => {
    try {
      await updateEquipment(item.id, { available: !item.available });
      await loadEquipment();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cambiar la disponibilidad.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de Equipamiento
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administración del catálogo y cantidades de recursos del auditorio.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center space-x-2 unior-gradient text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:opacity-95 transition self-start"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Agregar Recurso</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {editingId ? 'Editar Equipamiento' : 'Nuevo Equipamiento'}
            </h2>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues({ ...formValues, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="Ej. Proyector"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min={0}
                  value={formValues.quantity}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                value={formValues.description}
                onChange={(e) =>
                  setFormValues({ ...formValues, description: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                placeholder="Descripción del equipamiento (opcional)"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formValues.available}
                  onChange={(e) =>
                    setFormValues({ ...formValues, available: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Disponible para reservas
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex items-center gap-2 px-4 py-2 unior-gradient text-white text-sm font-semibold rounded-xl shadow-md hover:opacity-95 transition disabled:opacity-50"
              >
                {formLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-amber-300" />
                )}
                <span>{editingId ? 'Guardar Cambios' : 'Crear Recurso'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Equipment List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Cargando equipamiento...</p>
        </div>
      ) : equipment.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            Sin equipamiento registrado
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Agrega el primer recurso del auditorio para comenzar.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-xl hover:bg-blue-800 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar recurso</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-slate-200 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition ${
                    item.available
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
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
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {item.name}
              </h3>

              {item.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs mb-4">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold">
                  {item.quantity} unidad{item.quantity !== 1 ? 'es' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
