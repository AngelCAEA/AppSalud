/**
 * Página de Recuperación de Contraseña
 * 
 * Permite a los usuarios solicitar un enlace para restablecer su contraseña.
 * Pantalla completamente responsiva con diseño moderno centrado.
 */

// Components
import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle, Activity, Mail, ArrowLeft } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Componente ForgotPassword
 * 
 * Características:
 * - Layout centrado y responsivo
 * - Soporte para mostrar estado de la solicitud
 * - Icono de correo en el input
 * - Validación de errores integrada
 * - Link para volver al login
 * 
 * @component
 * @param {Object} props - Las propiedades del componente
 * @param {string} [props.status] - Mensaje de estado a mostrar
 * @returns {JSX.Element} Página de recuperación de contraseña
 */
export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-8 sm:py-12">
            <Head title="Recuperar contraseña" />

            {/* ── Contenedor principal ───────────────────────────────────────────
                max-w-md: ancho máximo para pantallas grandes
                w-full: ocupa todo el ancho disponible en pantallas pequeñas
                Responsive padding en diferentes breakpoints
            ─────────────────────────────────────────────────────────────────── */}
            <div className="w-full max-w-md">
                
                {/* ── Tarjeta Principal (Encabezado + Formulario + Botones) ──────
                    Fondo blanco/oscuro con bordes redondeados
                    Sombra para profundidad visual
                    Contiene TODO: encabezado, formulario y botones
                ────────────────────────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md dark:shadow-lg p-6 sm:p-8 space-y-6">
                    
                    {/* ── Encabezado de la página ────────────────────────────────────
                        Logo + Título + Descripción
                        Todos los elementos centrados
                    ────────────────────────────────────────────────────────────────── */}
                    <div className="text-center">
                        {/* Icono y Título Principal */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-2 sm:p-3 bg-white dark:bg-white rounded-lg">
                                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-600" strokeWidth={2.5} />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                App Salud
                            </h1>
                        </div>

                        {/* Títulos y Descripción */}
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3">
                            Recuperar contraseña
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                            Introduce el correo electrónico asociado a tu cuenta clínica y te enviaremos las instrucciones para restablecer tu contraseña.
                        </p>
                    </div>

                    {/* Separador visual */}
                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                    
                    {/* Mensaje de estado (si existe) */}
                    {status && (
                        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">
                            {status}
                        </div>
                    )}

                    {/* ── Formulario de Recuperación ────────────────────────────
                        Usa el controlador de Inertia para manejar la solicitud
                    ───────────────────────────────────────────────────────────── */}
                    <Form {...PasswordResetLinkController.store.form()}>
                        {({ processing, errors }) => (
                            <>
                                {/* Campo de Email */}
                                <div className="space-y-2 pb-6 sm:pb-8">
                                    <Label 
                                        htmlFor="email"
                                        className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm"
                                    >
                                        Correo Electrónico
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            autoFocus
                                            required
                                            placeholder="email@ejemplo.com"
                                            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all caret-gray-900 dark:caret-white"
                                        />
                                    </div>
                                    {errors.email && (
                                        <InputError message={errors.email} />
                                    )}
                                </div>

                                {/* Separador visual antes de los botones */}
                                <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                                {/* ── Botones de Acción ──────────────────────────────
                                    Dentro de la tarjeta
                                    Responsive en diseño y tamaño
                                ───────────────────────────────────────────────────── */}
                                <div className="space-y-3 sm:space-y-4">
                                    {/* Botón de Envío */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 text-xs sm:text-sm"
                                        data-test="send-reset-link-button"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <LoaderCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                                                Enviando...
                                            </span>
                                        ) : (
                                            'Enviar instrucciones'
                                        )}
                                    </Button>

                                    {/* Botón para volver al login */}
                                    <Link
                                        href={login()}
                                        className="w-full py-2.5 sm:py-3 inline-flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-semibold rounded-lg text-xs sm:text-sm no-underline"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        Volver al inicio de sesión
                                    </Link>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* ── Footer / Información Adicional ────────────────────────────
                    Espacio para agregar información adicional si es necesario
                    Por ejemplo: "No recibes el correo? Contacta a soporte"
                ────────────────────────────────────────────────────────────────── */}
                <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    {/* Agregar contenido adicional aquí si es necesario */}
                </div>
            </div>
        </div>
    );
}
