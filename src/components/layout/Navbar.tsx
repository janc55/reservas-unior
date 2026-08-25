import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import {
  Calendar,
  PlusCircle,
  Clock,
  Shield,
  Package,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  History,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUserDropdownOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#0f2b5c] text-white shadow-lg sticky top-0 z-50 border-b border-yellow-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Institution Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d4af37] to-amber-200 flex items-center justify-center text-[#0f2b5c] font-black text-xl shadow-md group-hover:scale-105 transition">
              U
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight block text-white group-hover:text-amber-300 transition">
                UNIOR <span className="font-light text-amber-400 text-xs uppercase tracking-wider block">Auditorio</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                isActive('/')
                  ? 'bg-white/10 text-amber-300 border border-amber-400/30'
                  : 'text-slate-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Disponibilidad</span>
            </Link>

            <Link
              to="/equipamiento"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                isActive('/equipamiento')
                  ? 'bg-white/10 text-amber-300 border border-amber-400/30'
                  : 'text-slate-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>Equipamiento</span>
            </Link>

            {currentUser && (
              <>
                <Link
                  to="/mis-reservas"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                    isActive('/mis-reservas')
                      ? 'bg-white/10 text-amber-300 border border-amber-400/30'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Mis Reservas</span>
                </Link>

                <Link
                  to="/reservas/nueva"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                    isActive('/reservas/nueva')
                      ? 'bg-white/10 text-amber-300 border border-amber-400/30'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Nueva Reserva</span>
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <div className="h-4 w-px bg-white/20 mx-1" />
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 ${
                    isActive('/admin')
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/30'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Panel Admin</span>
                </Link>

                <Link
                  to="/admin/equipamiento"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                    isActive('/admin/equipamiento')
                      ? 'bg-white/10 text-amber-300 border border-amber-400/30'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>Equipamiento</span>
                </Link>

                <Link
                  to="/admin/historial"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                    isActive('/admin/historial')
                      ? 'bg-white/10 text-amber-300 border border-amber-400/30'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Historial</span>
                </Link>
              </>
            )}
          </div>

          {/* User Auth Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl text-sm font-medium border border-white/10 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate text-slate-100">
                    {userProfile?.displayName || currentUser.email}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase border border-amber-400/30">
                      Admin
                    </span>
                  )}
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-slate-100 text-slate-800 z-50"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Conectado como</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {userProfile?.displayName || 'Usuario'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <p className="text-[11px] text-blue-900 font-medium mt-1">
                        Dpto: {userProfile?.department || 'N/A'}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Mi Perfil</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-100 hover:text-white hover:bg-white/10 transition flex items-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Iniciar Sesión</span>
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 transition shadow-md flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrarse</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d2146] border-t border-white/10 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/10 hover:text-white"
          >
            Disponibilidad Pública
          </Link>
          <Link
            to="/equipamiento"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/10 hover:text-white"
          >
            Catálogo de Equipamiento
          </Link>

          {currentUser ? (
            <>
              <Link
                to="/mis-reservas"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/10 hover:text-white"
              >
                Mis Reservas
              </Link>
              <Link
                to="/reservas/nueva"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/10 hover:text-white"
              >
                Nueva Reserva
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/10 hover:text-white"
              >
                Mi Perfil
              </Link>

              {isAdmin && (
                <>
                  <div className="border-t border-white/10 my-2 pt-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Administración
                  </div>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium bg-amber-500/20 text-amber-300"
                  >
                    Panel Admin
                  </Link>
                  <Link
                    to="/admin/equipamiento"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/10"
                  >
                    Gestión de Equipamiento
                  </Link>
                  <Link
                    to="/admin/historial"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/10"
                  >
                    Historial de Reservas
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 mt-2"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 rounded-xl text-base font-medium bg-white/10 text-white"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 rounded-xl text-base font-semibold bg-amber-400 text-slate-950"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
