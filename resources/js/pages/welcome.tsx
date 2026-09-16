import { Clock, Stethoscope, Bell, Activity, TrendingUp, ShieldCheck, Mail, Linkedin } from 'lucide-react';
import { type SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import WelcomeAuth from './auth/welcome-auth';

export function WelcomeGuest() {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Header/Nav */}
      <header className="border-b border-white/10 bg-[#0a0f1e]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#f1f5f9]">App Salud</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.visit(route('login'))}
              className="px-4 py-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors cursor-pointer text-sm font-medium"
            >
              Iniciar sesión
            </button>
            <a
              href="mailto:carrizosaespinoza@gmail.com?subject=Solicitud de cuenta - App Salud"
              className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-[#2563eb]/20 px-4 py-2 text-sm font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contactar soporte
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-white/5 w-fit">
              <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
              <span className="text-sm font-medium text-[#94a3b8]">Monitoreo en tiempo real</span>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-[#f1f5f9]">
                Toma el control de tu <span className="text-[#2563eb]">salud</span>, sin esfuerzo
              </h1>
              <p className="text-lg text-[#94a3b8] leading-relaxed">
                Monitorea tu glucosa y presión arterial, conéctate instantáneamente con tu médico
                y recibe alertas inteligentes para tu tranquilidad.
              </p>
            </div>

            {/* Contact Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="mailto:carrizosaespinoza@gmail.com?subject=Solicitud de cuenta - App Salud"
                className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-[#2563eb]/30 h-12 px-8 inline-flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Mail className="w-5 h-5" />
                Enviar correo
              </a>
              <a
                href="https://www.linkedin.com/in/angel-carrizosa-espinoza-b4389b289"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/15 hover:border-white/30 text-[#f1f5f9] hover:bg-white/5 h-12 px-8 inline-flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4 text-[#94a3b8]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
                <span className="text-sm">100% seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#2563eb]" />
                <span className="text-sm">Alertas 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#a78bfa]" />
                <span className="text-sm">Multi-consultorios</span>
              </div>
            </div>
          </div>

          {/* Right Column - App Mockup */}
          <div className="relative hidden md:block">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/10 to-[#a78bfa]/10 rounded-3xl transform -rotate-2 blur-3xl" />

            {/* Phone Mockup */}
            <div className="relative bg-[#1a202c] rounded-3xl shadow-2xl border-8 border-[#0a0f1e] overflow-hidden max-w-sm mx-auto">
              {/* Phone Top Bar */}
              <div className="bg-[#0a0f1e] h-8 flex items-center justify-center">
                <div className="w-32 h-5 bg-[#1a202c] rounded-full" />
              </div>

              {/* App Content */}
              <div className="p-6 space-y-6 bg-gradient-to-b from-[#1a202c] to-[#111827]">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#64748b]">Hoy, 16 Sep 2026</p>
                    <p className="text-lg font-semibold text-[#f1f5f9]">Panel de Salud</p>
                  </div>
                  <div className="w-10 h-10 bg-[#2563eb]/20 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#2563eb]" />
                  </div>
                </div>

                {/* Glucose KPI Card */}
                <div className="bg-gradient-to-br from-[#22c55e]/10 to-[#4ade80]/10 rounded-2xl p-5 border border-[#22c55e]/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#4ade80] font-medium">Glucosa Actual</span>
                    <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                  </div>
                  <div className="text-4xl font-bold text-[#4ade80] mb-1">
                    118
                    <span className="text-xl text-[#22c55e] ml-1">mg/dL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#22c55e]/20 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#22c55e] rounded-full" />
                    </div>
                    <span className="text-xs text-[#4ade80]">Óptimo</span>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-[#94a3b8] mb-3">Tendencia 7 días</p>
                  <div className="h-24 flex items-end justify-between gap-1">
                    {[65, 78, 82, 70, 85, 92, 88].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-[#2563eb] to-[#60a5fa] rounded-t-full transition-all hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-[#64748b] mt-2">
                    <span>Lun</span>
                    <span>Dom</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#a78bfa]/10 rounded-xl p-3 border border-[#a78bfa]/20">
                    <p className="text-xs text-[#a78bfa] mb-1">TIR</p>
                    <p className="text-2xl font-bold text-[#d8b4fe]">85%</p>
                  </div>
                  <div className="bg-[#f87171]/10 rounded-xl p-3 border border-[#f87171]/20">
                    <p className="text-xs text-[#f87171] mb-1">Presión</p>
                    <p className="text-xl font-bold text-[#fca5a5]">120/80</p>
                  </div>
                </div>
              </div>

              {/* Phone Bottom Bar */}
              <div className="bg-[#111827] h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#f1f5f9] mb-4">
            Tu Salud, Nuestra Prioridad
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            Herramientas profesionales diseñadas para hacer tu monitoreo más simple y efectivo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-8 text-center transition-all hover:border-white/20">
            <div className="w-16 h-16 bg-[#2563eb]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-8 h-8 text-[#2563eb]" />
            </div>
            <h3 className="text-xl font-semibold text-[#f1f5f9] mb-3">
              Registro en segundos
            </h3>
            <p className="text-[#94a3b8] leading-relaxed">
              Comienza a monitorear tu salud en menos de un minuto. UX diseñada para máxima simplicidad.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-8 text-center transition-all hover:border-white/20">
            <div className="w-16 h-16 bg-[#22c55e]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-8 h-8 text-[#22c55e]" />
            </div>
            <h3 className="text-xl font-semibold text-[#f1f5f9] mb-3">
              Conexión médica real
            </h3>
            <p className="text-[#94a3b8] leading-relaxed">
              Tu médico ve tus datos en tiempo real. Telemonitoreo profesional sin salir de casa.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-8 text-center transition-all hover:border-white/20">
            <div className="w-16 h-16 bg-[#a78bfa]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Bell className="w-8 h-8 text-[#a78bfa]" />
            </div>
            <h3 className="text-xl font-semibold text-[#f1f5f9] mb-3">
              Alertas inteligentes
            </h3>
            <p className="text-[#94a3b8] leading-relaxed">
              Recibe notificaciones automáticas si tus valores salen de rango. Tu seguridad 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center mb-16">
        <div className="rounded-3xl border border-[#2563eb]/30 bg-gradient-to-br from-[#2563eb]/10 to-[#a78bfa]/10 p-12 shadow-2xl">
          <h2 className="text-3xl font-bold text-[#f1f5f9] mb-4">
            ¿Listo para cuidar tu salud?
          </h2>
          <p className="text-[#94a3b8] text-lg mb-8 max-w-2xl mx-auto">
            Contáctanos para crear tu cuenta y comenzar a monitorear tu salud de forma profesional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:carrizosaespinoza@gmail.com?subject=Solicitud de cuenta - App Salud"
              className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-[#2563eb]/30 h-12 px-8 inline-flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Mail className="w-5 h-5" />
              Enviar correo
            </a>
            <a
              href="https://www.linkedin.com/in/angel-carrizosa-espinoza-b4389b289"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/15 hover:border-white/30 text-[#f1f5f9] hover:bg-white/5 h-12 px-8 inline-flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#64748b] text-sm">© 2026 App Salud. Todos los derechos reservados.</span>
          </div>
          <div className="flex gap-6 text-[#64748b] text-sm">
            <button className="hover:text-[#f1f5f9] transition-colors">Privacidad</button>
            <button className="hover:text-[#f1f5f9] transition-colors">Términos</button>
            <a href="mailto:carrizosaespinoza@gmail.com" className="hover:text-[#f1f5f9] transition-colors flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Contacto
            </a>
            <a href="https://www.linkedin.com/in/angel-carrizosa-espinoza-b4389b289" target="_blank" rel="noopener noreferrer" className="hover:text-[#f1f5f9] transition-colors flex items-center gap-1">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
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
