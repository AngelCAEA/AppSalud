'use client';

import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Activity, Shield, Mail, Lock } from 'lucide-react';
import { request } from '@/routes/password';

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

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            <Head title="Iniciar sesión" />

            {/* Contenedor principal con layout responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* SECCIÓN IZQUIERDA - Formulario */}
                <div className="flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 py-12 sm:py-16 bg-white">
                    <div className="w-full max-w-md">
                        {/* Encabezado del formulario */}
                        <div className="mb-8 sm:mb-10 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" strokeWidth={2.5} />
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    App Salud
                                </h1>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">
                                Bienvenido de vuelta
                            </h2>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Ingresa tus credenciales para acceder a tu panel clínico.
                            </p>
                        </div>

                        {/* Mensaje de estado */}
                        {status && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700">
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
                                            className="text-gray-700 font-medium text-sm sm:text-base"
                                        >
                                            Correo electrónico
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@gmail.com"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                                className="text-gray-700 font-medium text-sm sm:text-base"
                                            >
                                                Contraseña
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                                                    tabIndex={5}
                                                >
                                                    ¿Olvidaste tu contraseña?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
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
                                            className="text-gray-700 text-sm sm:text-base cursor-pointer font-medium"
                                        >
                                            Recuérdame
                                        </Label>
                                    </div>

                                    {/* Botón de Inicio de Sesión */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        tabIndex={4}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                Iniciando sesión...
                                            </span>
                                        ) : (
                                            'Iniciar Sesión'
                                        )}
                                    </Button>

                                    {/* Enlaces de contacto */}
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <p className="text-center text-gray-600 text-xs sm:text-sm mb-4">
                                            ¿No tienes cuenta? Contacta a soporte para crear una.
                                        </p>
                                        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                                            <a
                                                href="mailto:carrizosaespinoza@gmail.com?subject=Solicitud de cuenta - App Salud"
                                                className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm transition-colors"
                                                tabIndex={5}
                                            >
                                                📧 Enviar correo
                                            </a>
                                            <span className="hidden sm:inline text-gray-300">•</span>
                                            <a
                                                href="https://www.linkedin.com/in/angel-carrizosa-espinoza-b4389b289"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm transition-colors"
                                                tabIndex={6}
                                            >
                                                💼 LinkedIn
                                            </a>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {/* SECCIÓN DERECHA - Imagen de Fondo (oculta en móvil/tablet) */}
                <div className="hidden lg:flex flex-col justify-between items-center relative bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                    {/* Imagen de fondo */}
                    <div className="absolute inset-0">
                        <img
                            src={backgroundImageUrl}
                            alt="Healthcare professional"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        {/* Overlay de gradiente para mejor legibilidad */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-blue-900/20"></div>
                    </div>

                    {/* Gradiente azul en la parte inferior como sombreado */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-blue-900/20 to-blue-900/60 pointer-events-none"></div>

                    {/* Contenido superpuesto en la imagen */}
                    <div className="relative z-10 text-white text-center px-8 max-w-md py-12">
                        {/* Contenido superior vacío para espaciado */}
                    </div>

                    {/* Tarjeta de Seguridad - Posicionada en la parte inferior */}
                    <div className="relative z-20 px-8 max-w-md mb-12">
                        <div className="p-6 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/20 rounded-xl flex-shrink-0">
                                    <Shield className="w-6 h-6 text-white" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-sm sm:text-base mb-1">
                                        Seguridad y monitoreo inteligente en cada lectura.
                                    </h3>
                                    <p className="text-white/80 text-xs sm:text-sm">
                                        Sistema médico de confianza institucional
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
