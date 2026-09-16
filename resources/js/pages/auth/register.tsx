import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Activity, User, Mail, Lock } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
    return (
        <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-center items-center px-6 sm:px-8 md:px-12 py-12 sm:py-16">
            <Head title="Registro" />

            {/* Contenedor de la card */}
            <div className="w-full max-w-2xl">
                {/* Logo centrado */}
                <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10">
                    <div className="p-2 bg-[#2563eb] rounded-lg">
                        <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9]">
                        App Salud
                    </h1>
                </div>

                {/* Card principal */}
                <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-8 sm:p-10 space-y-6">
                    {/* Títulos */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] mb-4">
                            Crear una cuenta
                        </h2>
                        <div className="text-sm text-[#94a3b8] space-y-2">
                            <p>
                                <span className="text-[#f87171] font-semibold">Importante:</span> Tu médico debe valorarte antes de crear tu cuenta. Una vez registrado, el doctor configurará tu perfil clínico y{' '}
                                <span className="text-[#4ade80] font-semibold">se te notificará cuando esté listo.</span>
                            </p>
                        </div>
                    </div>

                    {/* Formulario */}
                    <Form
                        {...RegisteredUserController.store.form()}
                        resetOnSuccess={['password', 'password_confirmation']}
                        disableWhileProcessing
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Grid 2 columnas */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Nombre */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-[#f1f5f9] font-medium">
                                            Nombre
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                name="name"
                                                placeholder="Nombre completo"
                                                className="w-full pl-12 pr-4 py-3 bg-white/4 border border-white/10 text-[#f1f5f9] placeholder-[#64748b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[#f1f5f9] font-medium">
                                            Correo electrónico
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                name="email"
                                                placeholder="email@example.com"
                                                className="w-full pl-12 pr-4 py-3 bg-white/4 border border-white/10 text-[#f1f5f9] placeholder-[#64748b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Contraseña */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-[#f1f5f9] font-medium">
                                            Contraseña
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-3 bg-white/4 border border-white/10 text-[#f1f5f9] placeholder-[#64748b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Confirmar Contraseña */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-[#f1f5f9] font-medium">
                                            Confirmar contraseña
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748b] pointer-events-none" />
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-4 py-3 bg-white/4 border border-white/10 text-[#f1f5f9] placeholder-[#64748b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                </div>

                                {/* Botón Crear Cuenta */}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-4 w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                    tabIndex={5}
                                    data-test="register-user-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    Crear cuenta
                                </Button>

                                {/* Link a login */}
                                <div className="text-center text-sm text-[#94a3b8] pt-4 border-t border-white/10">
                                    ¿Ya tienes una cuenta?{' '}
                                    <TextLink href={login()} tabIndex={6} className="text-[#2563eb] hover:text-[#1d4ed8] font-medium">
                                        Iniciar sesión
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </div>
    );
}
