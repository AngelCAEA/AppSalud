import { Head, Link, router } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import  { route }  from "ziggy-js";
import { Search, AlertCircle, Clock, Users as User, TrendingUp, SettingsIcon } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { useState, useEffect } from "react";
import { details } from "@/routes";
import { Card, CardContent } from "@/components/ui/card";

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  phone: string;
  address : string;
  municipality: string;
  status: boolean;
  riskLevel: string;
  tirPercentage: number;
  lastRecord: { value: string | null; date: string | null } | null;
}

interface UsersPageProps {
  users: {
    data: User[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
  };
  filters: {
    search?: string;
  };
  totalPatients: number;
  highRisk: number;
  noRecords: number;
}

export default function Users({ users, filters, totalPatients, highRisk, noRecords }: UsersPageProps) {
  const [search, setSearch] = useState(filters.search || "");
 
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
    if (search.trim() === "") {
      router.get(route("users"), {}, { preserveState: true, replace: true });
    } else {
      router.get(
        route("users"),
        { search },
        { preserveState: true, replace: true }
      );
    }
  }, 400);

  return () => clearTimeout(timeout);
}, [search]);
  return (
    <AppLayout breadcrumbs={[{ title: "Panel de pacientes", href: "#" }]}>
      <Head title="Pacientes" />
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Panel de pacientes</h1>
              <p className="text-gray-600 dark:text-white">Monitoreo de pacientes con diabetes e hipertensión</p>
            </div>
          </div>
        </div>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="relative aspect-video overflow-hidden rounded-xl">
            {}{/* Total Pacientes */}
            <Card className="rounded-xl border-gray-200">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Total Pacientes</p>
                        <p className="text-4xl font-semibold text-black dark:text-white">{totalPatients}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                         <User className="w-6 h-6 text-blue-600" />
                    </div>
                    </div>
                </CardContent>
              </Card>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-xl">
            {/* Riesgo Alto */}
            <Card className="rounded-xl border-gray-200">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Riesgo Alto</p>
                        <p className="text-4xl font-semibold text-black dark:text-white">{highRisk}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    </div>
                </CardContent>
              </Card>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-xl">
            {/* Sin Registros */}
            <Card className="rounded-xl border-gray-200">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Sin Registros</p>
                        <p className="text-4xl font-semibold text-black dark:text-white">{noRecords}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-gray-600" />
                    </div>
                    </div>
                </CardContent>
              </Card>
          </div>
      </div>
        {/* 🔍 Buscador */}
        <div className="flex justify-between items-center p-2">
          <div className="relative">
            <Input
              className="rounded-xl pl-10 pr-4 w-120"
              placeholder="Buscar por nombre paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* 📋 Tabla */}
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Estado</th>
                <th className="py-2 px-4 text-left">Nombre</th>
                <th className="py-2 px-4 text-left">TIR (30 Días)</th>
                <th className="py-2 px-4 text-left">Úiltma lectura</th>
                <th className="py-2 px-4 text-left">Accion</th>
              </tr>
            </thead>
            <tbody>
              {users.data.length > 0 ? (
                users.data.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="py-2 px-4">
                      <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border ${getRiskColor(
                        user.riskLevel
                      )}`}
                    >
                      {getRiskLabel(user.riskLevel)}
                    </span>
                    </td>
                    <td className="py-2 px-4">{user.name}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-2">
                      <span>{user.tirPercentage}%</span>
                      {user.tirPercentage > 0 && (
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              user.tirPercentage >= 70
                                ? 'bg-green-500'
                                : user.tirPercentage >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${user.tirPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                    </td>
                    <td className="py-2 px-4">
                      <div>
                        {user.lastRecord && user.lastRecord.value ? (
                          <div>
                            <span className="text-gray-900 font-medium">{user.lastRecord.value}</span>
                            <br />
                            <span className="text-gray-600">
                              {user.lastRecord.date}
                            </span>
                          </div>
                          ) : (
                          <span className="text-gray-500">Sin registros</span>
                          )}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col gap-2">
                        {user.lastRecord && user.lastRecord.value ?(
                          <button
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                            onClick={() => router.visit(details(user.id))}
                          >
                            <TrendingUp className="w-4 h-4" />
                            Ver Detalles
                          </button>
                        ):(
                          <span className="text-gray-500">No hay detalles</span>
                        )}
                        <button 
                          onClick={() => router.visit(route('configuration', user.id))}
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          
                        >
                          <SettingsIcon className="w-4 h-4" />
                          Configurar perfil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4"
                  >
                   <div className="text-center py-12 text-gray-500">
                      No se encontraron pacientes
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                    ? "bg-white text-black dark:text-white border-black dark:bg-black dark:border-white"
                    : "text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                  }
                  ${!link.url ? "opacity-50 cursor-default" : "cursor-pointer"}
                `}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
