import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                U
              </div>
              <span className="font-bold text-white text-base">Universidad Privada de Oruro</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Sistema de Gestión de Reservas del Auditorio Institucional. Optimización y transparencia en el uso de espacios y recursos académicos.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-sm mb-3">Contacto e Información</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Oruro, Bolivia</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>+591 2 5253000</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>auditorio@unior.edu.bo</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-sm mb-3">Horario Operativo del Auditorio</h4>
            <p className="text-xs text-slate-400 mb-2">
              Lunes a Viernes: 08:00 - 21:00 <br />
              Sábados: 08:00 - 14:00
            </p>
            <p className="text-[11px] text-amber-400/80 font-medium">
              Zona Horaria Oficial: America/La_Paz (UTC-4)
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} UNIOR - Universidad Privada de Oruro. Todos los derechos reservados.</p>
          <p className="mt-2 sm:mt-0">Diplomado Full Stack - Proyecto Reservas</p>
        </div>
      </div>
    </footer>
  );
};
