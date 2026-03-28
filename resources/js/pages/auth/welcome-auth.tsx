import { dashboard, home, pacient, users } from '@/routes';
import { type SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Shield, Clock, Activity, LogOut, HeadphonesIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';

// Componente de confeti
const Confetti = () => {
  const confettiPieces = Array.from({ length: 50 });
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((_, i) => {
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 0.5;
        const randomDuration = 2 + Math.random() * 2;
        const randomRotation = Math.random() * 360;
        const colors = ['#10b981', '#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${randomX}%`,
              top: '-10px',
              backgroundColor: randomColor,
            }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{
              y: window.innerHeight + 20,
              opacity: [1, 1, 0],
              rotate: randomRotation * 3,
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              ease: 'linear',
            }}
          />
        );
      })}
    </div>
  );
};

export default function Welcome() {

    const { auth } = usePage<SharedData>().props;
    const [showConfetti, setShowConfetti] = useState(false);
    
    // Determinar el estado basado en si el usuario está validado Y tiene rol asignado
    const status = auth.user.status === true && auth.user.role_id !== 0 ? 'approved' : 'pending';
    const userName = auth.user.name || '';
    const userRole = auth.user.role_id ? 'Paciente' : 'Usuario';
    const cleanup = useMobileNavigation();


    const handleLogout = () => {
        cleanup();
        router.post('/logout', {}, {
            onSuccess: () => {
                window.location.href = '/login';
            },
            onError: (errors) => {
                console.error('Error en logout:', errors);
                window.location.href = '/login';
            }
        });
    };

    useEffect(() => {
        if (auth.user.status === true && auth.user.role_id !== 0) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [auth.user?.status, auth.user?.role_id]);

    const handleGoToPanel = () => {
        if (auth.user?.role_id === 1) {
            window.location.href = '/pacient';
        } else if (auth.user?.role_id === 2) {
            window.location.href = '/users';
        } else if (auth.user?.role_id === 3) {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/';
        }
    };

    return (
        <>
            <Head title="Bienvenido">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen flex flex-col items-center justify-between p-12">
                {showConfetti && <Confetti />}
                
                {/* Logo Superior */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="pt-8"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Activity className=" text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-semibold text-dark dark:text-white">App Salud</span>
                    </div>
                </motion.div>
                {/* Contenido Central */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-lg"
                >
                    {status === 'pending' ? (
                    // Estado de espera - Diseño limpio y centrado
                    <Card className="rounded-2xl border border-gray-200 shadow-sm">
                        <CardContent>
                        {/* Icono central - Escudo con Reloj */}
                        <div className="flex justify-center mb-8">
                            <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="relative"
                            >
                            <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center relative">
                                <Shield className="w-12 h-12 text-blue-600" />
                                <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm">
                                <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            </motion.div>
                        </div>

                        {/* Título y Subtítulo */}
                        <div className="text-center mb-10 space-y-3">
                            <h1 className="text-dark dark:text-white">Estamos verificando tu perfil</h1>
                            <p className="text-dark dark:text-white leading-relaxed max-w-md mx-auto">
                            Por seguridad médica, un administrador debe validar tus credenciales.
                            </p>
                        </div>
                        {/* Barra de Progreso */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-400">Progreso de validación</span>
                            {auth.user.status === true && auth.user.role_id !== 0 ? (
                                <span className="text-sm font-medium">100%</span>
                            ) : auth.user.status === true && auth.user.role_id === 0 ? (
                                <span className="text-sm font-medium">50%</span>
                            ) : (
                                <span className="text-sm font-medium">0%</span>
                            )}
                            </div>
                            <Progress value={auth.user.status === true && auth.user.role_id !== 0 ? 100 : auth.user.status === true && auth.user.role_id === 0 ? 50 : 0} className="h-2.5 bg-gray-100" />
                        </div>
                        </CardContent>
                    </Card>
                    ) : (
                    // Estado aprobado - Con confeti
                    <Card className="rounded-2xl border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
                        <CardContent className="p-12">
                        {/* Icono aprobado */}
                        <div className="flex justify-center mb-8">
                            <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 15,
                            }}
                            >
                            <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center relative">
                                <Shield className="w-12 h-12 text-emerald-600" />
                                <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                                className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md"
                                >
                                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                                </motion.div>
                            </div>
                            </motion.div>
                        </div>

                        {/* Título y Subtítulo */}
                        <div className="text-center mb-10 space-y-3">
                            <motion.h1
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 150 }}
                            className="text-gray-900"
                            >
                            ¡Todo listo, {userName}!
                            </motion.h1>
                            <p className="text-gray-500 leading-relaxed">
                            Tu acceso ha sido activado.
                            </p>
                        </div>

                        {/* Botón Principal */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                            onClick={handleGoToPanel}
                            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-14 text-base group cursor-pointer"
                            >
                            Ir a mi Panel
                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </motion.div>
                            </Button>
                        </motion.div>
                        </CardContent>
                    </Card>
                    )}
                </motion.div>
                {/* Parte Inferior - Botones de Acción */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="pb-8 space-y-6 w-full max-w-lg"
                >
                    {status === 'pending' && (
                    <>
                        <button
                            onClick={handleLogout}
                            className="w-full rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 h-12 cursor-pointer flex items-center justify-center gap-2 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                        </button>
                        
                        <button
                        onClick={() => console.log('Soporte técnico')}
                        className="w-full text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 py-2"
                        >
                        <HeadphonesIcon className="w-4 h-4" />
                        Soporte técnico
                        </button>
                    </>
                    )}
                </motion.div>
            </div>
            
          
        </>
    );
}
