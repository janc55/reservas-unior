import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfileDetails } from '../../services/authService';
import { becomeFirstAdmin } from '../../services/adminService';
import { User, Mail, Building, Phone, Shield, Save, Loader2, CheckCircle2, AlertCircle, Crown } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, refreshProfile, isAdmin } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setDepartment(userProfile.department || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSuccessMsg(null);
    setErrorMsg(null);

    if (!displayName.trim() || !department.trim() || !phone.trim()) {
      setErrorMsg('Todos los campos de perfil son obligatorios.');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfileDetails(currentUser.uid, {
        displayName: displayName.trim(),
        department: department.trim(),
        phone: phone.trim(),
      });
      await refreshProfile();
      setSuccessMsg('Perfil actualizado correctamente.');
    } catch (err: any) {
      setErrorMsg('No se pudo actualizar el perfil. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeAdmin = async () => {
    if (!currentUser) return;

    const confirmed = window.confirm(
      '¿Deseas convertirte en administrador?\n\nEsto te dará acceso completo al panel de administración.'
    );
    if (!confirmed) return;

    setAdminLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await becomeFirstAdmin(currentUser.uid);
      await refreshProfile();
      setSuccessMsg('¡Felicidades! Ahora eres administrador. Recarga la página si los cambios no se reflejan.');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'No se pudo completar la solicitud.'
      );
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Header */}
        <div className="unior-gradient text-white p-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{displayName || 'Usuario'}</h1>
                <p className="text-slate-300 text-xs">{currentUser?.email}</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow ${
                isAdmin
                  ? 'bg-amber-400 text-slate-950 border border-amber-300'
                  : 'bg-white/20 text-white border border-white/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Administrador' : 'Solicitante'}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Correo Electrónico (No modificable)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Facultad / Departamento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Teléfono de Contacto
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Rol del Usuario</span>
                <span className="text-xs text-slate-500">
                  {userProfile?.role === 'admin'
                    ? 'Cuenta con privilegios de administración completa.'
                    : 'Cuenta de solicitante de reservas.'}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-200 px-3 py-1 rounded-lg">
                {userProfile?.role || 'user'}
              </span>
            </div>

            {!isAdmin && (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Crown className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">
                        ¿Eres el primer usuario?
                      </span>
                      <span className="text-xs text-amber-700">
                        Conviértete en administrador para gestionar el sistema.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleBecomeAdmin}
                    disabled={adminLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition disabled:opacity-50"
                  >
                    {adminLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    <span>Hacerme Admin</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 unior-gradient text-white font-semibold text-sm rounded-xl shadow-lg hover:opacity-95 transition flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-300" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
