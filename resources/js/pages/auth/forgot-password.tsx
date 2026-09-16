import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle, Activity, Mail, ArrowLeft } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-8 sm:py-12">
            <Head title="Recuperar contraseña" />

            {/* Contenedor principal */}
            <div className="w-full max-w-md">

                {/* Tarjeta Principal */}
                <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">

                    {/* Encabezado */}
                    <div className="text-center">
                        {/* Logo y Título Principal */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-2 sm:p-3 bg-[#2563eb] rounded-lg">
                                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-[#f1f5f9]">
                                App Salud
                            </h1>
                        </div>

                        {/* Títulos y Descripción */}
                        <h2 className="text-lg sm:text-xl font-semibold text-[#f1f5f9] mb-2 sm:mb-3">
                            Recuperar contraseña
                        </h2>
                        <p className="text-[#94a3b8] text-xs sm:text-sm leading-relaxed">
                            Introduce el correo electrónico asociado a tu cuenta clínica y te enviaremos las instrucciones para restablecer tu contraseña.
                        </p>
                    </div>

                    {/* Separador visual */}
                    <div className="h-px bg-white/10"></div>

                    {/* Mensaje de estado */}
                    {status && (
                        <div className="p-3 sm:p-4 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg text-xs sm:text-sm font-medium text-[#4ade80]">
                            {status}
                        </div>
                    )}

                    {/* Formulario */}
                    <Form {...PasswordResetLinkController.store.form()}>
                        {({ processing, errors }) => (
                            <>
                                {/* Campo de Email */}
                                <div className="space-y-2 pb-6 sm:pb-8">
                                    <Label
                                        htmlFor="email"
                                        className="text-[#f1f5f9] font-medium text-sm"
                                    >
                                        Correo Electrónico
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            autoFocus
                                            required
                                            placeholder="email@ejemplo.com"
                                            className="w-full pl-12 pr-4 py-3 bg-white/4 border border-white/10 text-[#f1f5f9] placeholder-[#64748b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                                        />
                                    </div>
                                    {errors.email && (
                                        <InputError message={errors.email} />
                                    )}
                                </div>

                                {/* Separador visual */}
                                <div className="h-px bg-white/10"></div>

                                {/* Botones de Acción */}
                                <div className="space-y-3 sm:space-y-4">
                                    {/* Botón de Envío */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 text-sm"
                                        data-test="send-reset-link-button"
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                Enviando...
                                            </span>
                                        ) : (
                                            'Enviar instrucciones'
                                        )}
                                    </Button>

                                    {/* Botón para volver al login */}
                                    <Link
                                        href={login()}
                                        className="w-full py-3 inline-flex items-center justify-center gap-2 text-[#94a3b8] hover:text-[#f1f5f9] border border-white/10 hover:border-white/20 font-semibold rounded-lg text-sm no-underline transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Volver al inicio de sesión
                                    </Link>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* Footer adicional */}
                <div className="mt-6 text-center text-xs text-[#64748b]">
                    {/* Espacio para contenido adicional */}
                </div>
            </div>
        </div>
    );
}
