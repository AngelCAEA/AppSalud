'use client';

import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Activity, ShieldCheck, Mail, Lock, Eye, EyeOff, Stethoscope, Linkedin } from 'lucide-react';
import { request } from '@/routes/password';
import { useState } from 'react';

/**
 * Props para el componente Login
 * @typedef {Object} LoginProps
 * @property {string} [status] - Mensaje de estado a mostrar (ej: confirmación de email)
 * @property {boolean} canResetPassword - Indica si se puede restablecer la contraseña
 */
interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

/**
 * Componente de Login con diseño moderno y responsivo
 * 
 * Características:
 * - Layout de dos columnas (formulario + imagen) en desktop
 * - Diseño adaptable para tablets y móviles
 * - Imagen de fondo responsiva desde URL externa
 * - Validación de errores integrada
 * - Soporte para "Recuérdame"
 * - Recuperación de contraseña
 * 
 * @component
 * @param {LoginProps} props - Las propiedades del componente
 * @returns {JSX.Element} Página de login renderizada
 * 
 * @example
 * <Login status="Email confirmado" canResetPassword={true} />
 */
export default function Login({ status, canResetPassword }: LoginProps) {
    // URL de la imagen de fondo desde Unsplash
    const backgroundImageUrl = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920';

    /**
     * Estado para controlar la visibilidad de la contraseña
     * @type {[boolean, Function]}
     */
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0f1e] overflow-hidden">
            <Head title="Iniciar sesión" />

            {/* Contenedor principal con layout responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* SECCIÓN IZQUIERDA - Formulario */}
                <div className="flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 py-12 sm:py-16 bg-[#0f172a]">
                    <div className="w-full max-w-md">
                        {/* Encabezado del formulario */}
                        <div className="mb-8 sm:mb-10 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="p-2 bg-[#2563eb] rounded-lg">
                                    <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9]">
                                    App Salud
                                </h1>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-[#f1f5f9] mb-3">
                                Bienvenido de vuelta
                            </h2>
                            <p className="text-[#94a3b8] text-sm sm:text-base">
                                Ingresa tus credenciales para acceder a tu panel clínico.
                            </p>
                        </div>

                        {/* Mensaje de estado */}
                        {status && (
                            <div className="mb-6 p-4 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg text-sm font-medium text-[#4ade80]">
                                {status}
                            </div>
                        )}

                        {/* Formulario de autenticación */}
                        <Form
                            {...AuthenticatedSessionController.store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Campo de Email */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="email"
                                            className="text-[#f1f5f9] font-medium text-sm sm:text-base"
                                        >
                                            Correo electrónico
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@gmail.com"
                                                className="w-full pl-12 pr-4 py-3 bg-white/4 border border-white/10 text-[#f1f5f9] placeholder-[#64748b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                                            />
                                        </div>
                                        {errors.email && (
                                            <InputError message={errors.email} />
                                        )}
                                    </div>

                                    {/* Campo de Contraseña */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="password"
                                                className="text-[#f1f5f9] font-medium text-sm sm:text-base"
                                            >
                                                Contraseña
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-[#2563eb] hover:text-[#1d4ed8] text-xs sm:text-sm font-medium"
                                                    tabIndex={5}
                                                >
                                                    ¿Olvidaste tu contraseña?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-12 py-3 bg-white/4 border border-white/10 text-[#f1f5f9] placeholder-[#64748b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                                            />
                                            {/* Botón para mostrar/ocultar contraseña */}
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors focus:outline-none"
                                                tabIndex={-1}
                                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <InputError message={errors.password} />
                                        )}
                                    </div>

                                    {/* Checkbox de Recuérdame */}
                                    <div className="flex items-center space-x-3 py-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="w-4 h-4"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-[#f1f5f9] text-sm sm:text-base cursor-pointer font-medium"
                                        >
                                            Recuérdame
                                        </Label>
                                    </div>

                                    {/* Botón de Inicio de Sesión */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        tabIndex={4}
                                        className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                Iniciando sesión...
                                            </span>
                                        ) : (
                                            'Iniciar sesión'
                                        )}
                                    </Button>

                                    {/* Enlaces de contacto */}
                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <p className="text-center text-[#94a3b8] text-xs sm:text-sm mb-4">
                                            ¿No tienes cuenta? Contacta a soporte para crear una.
                                        </p>
                                        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                                            <a
                                                href="mailto:carrizosaespinoza@gmail.com?subject=Solicitud de cuenta - App Salud"
                                                className="text-[#2563eb] hover:text-[#1d4ed8] font-medium text-xs sm:text-sm transition-colors flex items-center gap-1"
                                                tabIndex={5}
                                            >
                                                <Mail className="w-4 h-4" />
                                                Enviar correo
                                            </a>
                                            <span className="hidden sm:inline text-[#64748b]">•</span>
                                            <a
                                                href="https://www.linkedin.com/in/angel-carrizosa-espinoza-b4389b289"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#2563eb] hover:text-[#1d4ed8] font-medium text-xs sm:text-sm transition-colors flex items-center gap-1"
                                                tabIndex={6}
                                            >
                                                <Linkedin className="w-4 h-4" />
                                                LinkedIn
                                            </a>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {/* SECCIÓN DERECHA - Visual Decorativo (oculta en móvil/tablet) */}
                <div className="hidden lg:flex flex-col justify-center items-center relative bg-gradient-to-br from-[#111827] to-[#0f172a] overflow-hidden">
                    {/* Fondo con efecto */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#2563eb]/10 via-transparent to-[#a78bfa]/5 pointer-events-none"></div>

                    {/* Contenido central */}
                    <div className="relative z-10 text-center px-8 max-w-md">
                        {/* Icono centrado */}
                        <div className="mb-12 flex justify-center">
                            <div className="p-6 bg-[#2563eb]/20 rounded-3xl border border-[#2563eb]/30">
                                <Stethoscope className="w-24 h-24 text-[#2563eb]" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Badge con mensaje */}
                        <div className="mt-24 inline-flex items-start gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl">
                            <ShieldCheck className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-1" />
                            <div className="text-left">
                                <h3 className="font-semibold text-[#f1f5f9] text-sm mb-1">
                                    Seguridad y monitoreo inteligente en cada lectura
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
