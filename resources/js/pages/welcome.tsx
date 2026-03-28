import { ArrowRight, Hourglass, Stethoscope, Bell, Activity, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import WelcomeAuth from './auth/welcome-auth';

export function WelcomeGuest() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header/Nav */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">App Salud</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.visit('/login')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Iniciar Sesión
            </button>
            <Button
              onClick={() => router.visit('/register')}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
            >
              Regístrate Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-gray-900 leading-tight">
                Toma el Mando de tu Salud, Sin Esfuerzo.
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Monitorea tu glucosa y presión arterial, conéctate instantáneamente con tu médico 
                y recibe alertas inteligentes para tu tranquilidad.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.visit('/register')}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 h-14 px-8 text-lg group"
              >
                Regístrate Gratis Ahora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button
                onClick={() => router.visit('/login')}
                className="h-14 px-8 text-lg text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Ya tengo cuenta
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4 text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Alertas 24/7</span>
              </div>
            </div>
          </div>

          {/* Right Column - App Mockup */}
          <div className="relative">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl transform rotate-3" />
            
            {/* Phone Mockup */}
            <div className="relative bg-white rounded-3xl shadow-2xl border-8 border-gray-900 overflow-hidden max-w-sm mx-auto">
              {/* Phone Top Bar */}
              <div className="bg-gray-900 h-8 flex items-center justify-center">
                <div className="w-32 h-5 bg-gray-800 rounded-full" />
              </div>

              {/* App Content */}
              <div className="p-6 space-y-6 bg-gradient-to-b from-white to-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Hoy, 26 Mar 2026</p>
                    <p className="text-lg font-semibold text-gray-900">Panel de Salud</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* Glucose KPI Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-green-700 font-medium">Glucosa Actual</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-4xl font-bold text-green-900 mb-1">
                    118
                    <span className="text-xl text-green-700 ml-1">mg/dL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-xs text-green-700">Óptimo</span>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Tendencia 7 días</p>
                  <div className="h-24 flex items-end justify-between gap-1">
                    {[65, 78, 82, 70, 85, 92, 88].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-full transition-all hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Lun</span>
                    <span>Dom</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                    <p className="text-xs text-purple-700 mb-1">TIR</p>
                    <p className="text-2xl font-bold text-purple-900">85%</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                    <p className="text-xs text-red-700 mb-1">Presión</p>
                    <p className="text-xl font-bold text-red-900">120/80</p>
                  </div>
                </div>
              </div>

              {/* Phone Bottom Bar */}
              <div className="bg-gray-50 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 bg-white rounded-3xl border border-gray-200 mx-6 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 mb-4">
            Tu Salud, Nuestra Prioridad
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Herramientas profesionales diseñadas para hacer tu monitoreo más simple y efectivo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Benefit Card 1 */}
          <Card className="rounded-2xl border-gray-200 hover:shadow-lg transition-shadow group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Hourglass className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Registro en segundos
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Comienza a monitorear tu salud en menos de un minuto. UX diseñada para máxima simplicidad.
              </p>
            </CardContent>
          </Card>

          {/* Benefit Card 2 */}
          <Card className="rounded-2xl border-gray-200 hover:shadow-lg transition-shadow group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Conexión Médica Real
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tu médico ve tus datos en tiempo real. Telemonitoreo profesional sin salir de casa.
              </p>
            </CardContent>
          </Card>

          {/* Benefit Card 3 */}
          <Card className="rounded-2xl border-gray-200 hover:shadow-lg transition-shadow group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Bell className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Alertas Inteligentes
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Recibe notificaciones automáticas si tus valores salen de rango. Tu seguridad 24/7.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-white mb-4">
            ¿Listo para cuidar tu salud?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Únete a miles de pacientes que ya confían en App Salud para su monitoreo diario
          </p>
          <Button
            onClick={() => router.visit('/register')}
            className="rounded-xl bg-white text-blue-600 hover:bg-gray-50 h-14 px-8 text-lg shadow-lg group"
          >
            Comenzar Ahora - Es Gratis
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-600">© 2026 App Salud. Todos los derechos reservados.</span>
          </div>
          <div className="flex gap-6 text-gray-600">
            <button className="hover:text-gray-900 transition-colors">Privacidad</button>
            <button className="hover:text-gray-900 transition-colors">Términos</button>
            <button className="hover:text-gray-900 transition-colors">Soporte</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Bienvenido">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            {auth.user ? <WelcomeAuth /> : <WelcomeGuest />}
        </>
    );
}
