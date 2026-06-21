import { Head, Link, router } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import  { route }  from "ziggy-js";
import { Search, Users as User, ArrowRight, Settings, ChevronRight, Newspaper, ShieldAlert, Hourglass } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { useState, useEffect } from "react";
import { details, reports } from "@/routes";
import { Card, CardContent } from "@/components/ui/card";
import { UsersPage, PatientsFilters } from "@/types/user";
import { Button } from '@/components/ui/button';


export default function Users({ users, filters, totalPatients, highRisk, noRecords }: UsersPage) {
  const [search, setSearch] = useState(filters.search || "");
  const [activeFilter, setActiveFilter] = useState<PatientsFilters>('all');

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'Riesgo Alto';
      case 'medium':
        return 'Inestable';
      case 'low':
        return 'Estable';
      default:
        return 'Sin Datos';
    }
  };
  // 🔍 Actualiza la URL (y los datos) cada vez que cambia el search
  useEffect(() => {
  const timeout = setTimeout(() => {
    const params: Record<string, string> = {};
    if (search.trim() !== "") params.search = search;
    if (activeFilter !== "all") params.filter = activeFilter;
    router.get(route("users"), params, { preserveState: true, replace: true });
  }, 400);

  return () => clearTimeout(timeout);
}, [search, activeFilter]);
  return (
    <AppLayout breadcrumbs={[{ title: "Panel de pacientes", href: "#" }]}>
      <Head title="Pacientes" />
      <div className="pl-8 pr-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 dark:text-white">Monitoreo de pacientes con diabetes e hipertensión</p>
            {/* ── Acceso rápido ── se puede cambiar href, ícono, texto y colores */}
            <Link
              href={reports()}
              className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 hover:shadow-md transition-shadow"
            >
              {/* Ícono: cambiar bg-blue-50 / text-blue-600 según sección destino */}
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Newspaper className="w-4 h-4 text-blue-600" />
              </div>
              {/* Texto del botón */}
              <span className="font-semibold text-blue-600 text-xs">Ir a Módulo de Reportes</span>
              {/* Flecha indicadora */}
              <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
            </Link>
          </div>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 mb-6">

          {/* Card 1 — Población de Pacientes */}
          <div className="flex items-center gap-5 rounded-2xl p-6 bg-blue-50">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider leading-tight mb-2">
                Población de<br />Pacientes
              </p>
              <p className="text-5xl font-bold text-blue-900 leading-none">{totalPatients}</p>
              <p className="text-sm text-blue-500 mt-2">Total registrado</p>
            </div>
          </div>

          {/* Card 2 — Pacientes de Riesgo Crítico */}
          <div className="flex items-center gap-5 rounded-2xl p-6 bg-red-50">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider leading-tight mb-2">
                Pacientes de<br />Riesgo Crítico
              </p>
              <p className="text-5xl font-bold text-red-900 leading-none">{highRisk}</p>
              <p className="text-sm text-red-500 mt-2">Requieren acción clínica inmediata</p>
            </div>
          </div>

          {/* Card 3 — Registros Pendientes */}
          <div className="flex items-center gap-5 rounded-2xl p-6 bg-orange-50">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Hourglass className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase tracking-wider leading-tight mb-2">
                Registros<br />Pendientes
              </p>
              <p className="text-5xl font-bold text-orange-900 leading-none">{noRecords}</p>
              <p className="text-sm text-orange-500 mt-2">Sin nuevos datos clínicos</p>
            </div>
          </div>

        </div>
      {/* 🔍 Filtros y Buscador */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Todos {activeFilter === 'all' && '(Activo)'}
          </button>
          <button onClick={() => setActiveFilter('high')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeFilter === 'high' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Riesgo Alto
          </button>
          <button onClick={() => setActiveFilter('unstable')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeFilter === 'unstable' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Inestable
          </button>
          <button onClick={() => setActiveFilter('noRecord')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeFilter === 'noRecord' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Sin Registro
          </button>
        </div>
        <div className="relative">
          <Input className="rounded-full pl-10 pr-4 w-56 bg-white border-gray-200" placeholder="Buscar paciente..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* 📋 Tabla */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado /<br />Riesgo</th>
                <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">TIR (30 Días)</th>
                <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Última<br />Lectura</th>
                <th className="py-3 px-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.data.length > 0 ? (
                users.data.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getRiskColor(user.riskLevel)}`}>
                        {getRiskLabel(user.riskLevel)}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-semibold text-gray-900 dark:text-white text-base">{user.name}</span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">{user.tirPercentage}%</span>
                        {user.tirPercentage > 0 ? (
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full ${user.tirPercentage >= 70 ? 'bg-green-500' : user.tirPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${user.tirPercentage}%` }} />
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {user.lastRecord && user.lastRecord.value ? (
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user.lastRecord.value}</p>
                          <p className="text-gray-500 text-sm mt-0.5">{user.lastRecord.date ? new Date(user.lastRecord.date).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : ''}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-orange-500 font-semibold text-sm">Sin datos nuevos</p>
                          <p className="text-gray-400 text-xs mt-0.5">Sin nuevos datos clínicos</p>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1.5">
                        <button onClick={() => router.visit(details(user.id))} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm cursor-pointer">
                          Ver Detalles <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => router.visit(route('configuration', user.id))} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm cursor-pointer">
                          <Settings className="w-3.5 h-3.5" />
                          Configuración
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="text-center py-12 text-gray-500">No se encontraron pacientes</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* 📄 Paginación */}
      <div className="flex items-center justify-between p-3 text-sm">
        <div className="flex items-center gap-2">
          {users.links.map((link, index) => (
            <Link
              key={index}
              href={link.url || "#"}
              className={`
                px-3 py-1 border rounded-md text-sm transition-colors duration-200 
                ${link.active
                  ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                  : "text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-900"
                }
                ${!link.url ? "opacity-50 cursor-default" : "cursor-pointer"}
              `}
              dangerouslySetInnerHTML={{ __html: link.label.replace('Previous', 'Anterior').replace('Next', 'Siguiente') }}
            />
          ))}
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
