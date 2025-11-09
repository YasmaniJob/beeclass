'use client';

import { FormEvent, useState, useEffect, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppConfig } from '@/hooks/use-app-config';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, UserPlus, Eye, EyeOff, ClipboardList, ShieldCheck, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type HeroSlide = {
    title: string;
    description: string;
    type: 'image' | 'illustration';
    icon?: ReactNode;
    image?: string;
    gradient?: string;
};

export default function RegistroPage() {
    const { register, user, isLoaded } = useCurrentUser();
    const router = useRouter();
    const { appName, institutionName, logoUrl, loginImageUrl } = useAppConfig();
    
    const [nombres, setNombres] = useState('');
    const [apellidoPaterno, setApellidoPaterno] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [heroSlideIndex, setHeroSlideIndex] = useState(0);

    const heroSlides = useMemo<HeroSlide[]>(() => {
        const slides: HeroSlide[] = [];

        if (loginImageUrl) {
            slides.push({
                type: 'image',
                title: 'Material institucional',
                description: 'Incluye fotos o recursos del colegio para orientar al nuevo equipo gestor.',
                image: loginImageUrl,
            });
        }

        slides.push(
            {
                type: 'illustration',
                title: 'Buenas prácticas de seguridad',
                description: 'Capacita al personal en el uso de credenciales y restablecimiento seguro.',
                icon: <ShieldCheck className="h-5 w-5" />,
                gradient: 'from-emerald-500/60 via-teal-500/60 to-slate-900/75',
            },
            {
                type: 'illustration',
                title: 'Material de bienvenida',
                description: 'Adjunta guías, políticas y recursos clave para la configuración inicial.',
                icon: <Sparkles className="h-5 w-5" />,
                gradient: 'from-violet-500/60 via-purple-500/60 to-slate-900/70',
            }
        );

        return slides;
    }, [loginImageUrl]);

    useEffect(() => {
        if (isLoaded && user) {
            router.push('/');
        }
    }, [user, isLoaded, router]);

    useEffect(() => {
        setHeroSlideIndex(0);
    }, [heroSlides.length]);

    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const timer = window.setInterval(() => {
            setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => window.clearInterval(timer);
    }, [heroSlides.length]);

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (step === 1) {
            if (!(nombres && apellidoPaterno && email)) {
                setError('Completa los datos solicitados para continuar.');
                return;
            }
            setStep(2);
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== repeatPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setIsSubmitting(true);
        try {
            await register(email, password, {
                nombres,
                apellidoPaterno,
            });
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err?.message ?? 'No se pudo completar el registro. Inténtalo más tarde.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isStepOneValid = Boolean(nombres && apellidoPaterno && email);
    const isStepTwoValid = Boolean(password && repeatPassword);
    const isFormValid = isStepOneValid && isStepTwoValid;

    const steps = [
        {
            label: 'Datos del responsable',
            description: 'Identidad y contacto institucional.'
        },
        {
            label: 'Credenciales seguras',
            description: 'Define el acceso para la cuenta principal.'
        }
    ];

    if (isLoaded && user) {
        return null; // Don't render anything if user is already logged in
    }

    const currentSlide = heroSlides[heroSlideIndex] ?? heroSlides[0];

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-6 md:px-8">
            <div className="relative flex h-[min(780px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.45)] ring-1 ring-slate-100/70 md:flex-row">
                <div className="relative flex h-full flex-1 flex-col bg-primary text-white">
                    <div className="absolute inset-0" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between px-8 pt-8 sm:px-10">
                            <div className="flex items-center gap-4">
                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10">
                                    {logoUrl ? (
                                        <Image src={logoUrl} alt="Logo institucional" width={48} height={48} className="h-10 w-10 object-contain" />
                                    ) : (
                                        <UserPlus className="h-6 w-6" />
                                    )}
                                </span>
                                <div className="space-y-1">
                                    <Badge variant="outline" className="border-white/30 bg-white/10 px-3 text-xs font-medium uppercase tracking-wide text-white/90">
                                        Registro institucional
                                    </Badge>
                                    <h2 className="text-2xl font-semibold leading-tight md:text-3xl">{appName}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center sm:px-10">
                            <div className="relative w-full max-w-xs overflow-hidden rounded-[32px] border border-white/20 bg-white/10">
                                <div
                                    className="flex transition-transform duration-500"
                                    style={{ transform: `translateX(-${heroSlideIndex * 100}%)` }}
                                >
                                    {heroSlides.map((slide, index) => (
                                        <div key={slide.title ?? index} className="w-full shrink-0">
                                            {slide.type === 'image' && slide.image ? (
                                                <div className="relative aspect-[3/4] w-full">
                                                    <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                                                    <div className="absolute inset-0 rounded-[32px] bg-slate-900/25" />
                                                </div>
                                            ) : (
                                                <div className={`relative aspect-[3/4] w-full overflow-hidden rounded-[32px] bg-gradient-to-br ${slide.gradient ?? 'from-indigo-500/60 via-blue-500/60 to-slate-900/70'}`}>
                                                    <div className="absolute inset-0 bg-white/10" />
                                                    {slide.icon && (
                                                        <span className="relative flex h-full w-full items-center justify-center">
                                                            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-white">
                                                                {slide.icon}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {currentSlide && (
                                <div className="space-y-2 text-white">
                                    <h3 className="text-xl font-semibold">{currentSlide.title}</h3>
                                    <p className="text-sm text-white/80">{currentSlide.description}</p>
                                </div>
                            )}
                            {heroSlides.length > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    {heroSlides.map((_, index) => (
                                        <span
                                            key={index}
                                            className={`h-1.5 rounded-full transition-all ${
                                                index === heroSlideIndex ? 'w-5 bg-white' : 'w-2 bg-white/40'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <section className="flex flex-1 items-center justify-center bg-white px-6 py-10 sm:px-10">
                    <div className="w-full max-w-md space-y-6">
                        <header className="space-y-2 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                                <UserPlus className="h-6 w-6 text-slate-500" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-semibold text-slate-900">Registro de administrador</h1>
                                <p className="text-sm text-slate-500">Completa los datos del responsable principal de la plataforma.</p>
                            </div>
                        </header>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error en el registro</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="flex items-center justify-center gap-3 text-xs font-medium text-slate-500">
                                {steps.map((item, index) => {
                                    const current = index + 1;
                                    const isActive = current === step;
                                    const isCompleted = current < step;
                                    return (
                                        <div key={item.label} className="flex items-center gap-2">
                                            <span
                                                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                                    isCompleted
                                                        ? 'bg-primary text-primary-foreground'
                                                        : isActive
                                                            ? 'bg-primary/90 text-white'
                                                            : 'bg-slate-200 text-slate-500'
                                                } text-[11px] font-semibold`}
                                            >
                                                {current}
                                            </span>
                                            <span className={`hidden sm:inline ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                                                {item.label}
                                            </span>
                                            {current < steps.length && <span className="hidden text-slate-300 sm:inline">—</span>}
                                        </div>
                                    );
                                })}
                            </div>

                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombres">Nombres</Label>
                                        <Input
                                            id="nombres"
                                            placeholder="María"
                                            value={nombres}
                                            onChange={event => setNombres(event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apellido-paterno">Apellido paterno</Label>
                                        <Input
                                            id="apellido-paterno"
                                            placeholder="Pérez"
                                            value={apellidoPaterno}
                                            onChange={event => setApellidoPaterno(event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Correo electrónico</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            inputMode="email"
                                            autoComplete="email"
                                            placeholder="admin@colegio.edu.pe"
                                            value={email}
                                            onChange={event => setEmail(event.target.value)}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">Utilizaremos este correo para confirmar el acceso principal.</p>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Crea una contraseña segura</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="new-password"
                                                value={password}
                                                onChange={event => setPassword(event.target.value)}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Debe tener al menos 6 caracteres e incluir números.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="repeat-password">Confirma la contraseña</Label>
                                        <div className="relative">
                                            <Input
                                                id="repeat-password"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="new-password"
                                                value={repeatPassword}
                                                onChange={event => setRepeatPassword(event.target.value)}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-500">
                                        Al crear esta cuenta aceptas los términos de uso y la política de privacidad de la institución.
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting || (step === 1 ? !isStepOneValid : !isFormValid)}
                                >
                                    {step === 1 ? 'Continuar' : isSubmitting ? 'Creando cuenta…' : 'Crear cuenta de administrador'}
                                </Button>
                                {step === 2 && (
                                    <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting}>
                                        Volver a datos del responsable
                                    </Button>
                                )}
                            </div>
                        </form>

                        <footer className="space-y-4 text-center text-sm text-slate-500">
                            <div className="text-xs">
                                ¿Ya tienes una cuenta?{' '}
                                <Link href="/login" className="font-semibold text-primary hover:underline">
                                    Inicia sesión
                                </Link>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Ajusta roles y permisos adicionales desde el panel de administración luego del ingreso.
                            </p>
                        </footer>
                    </div>
                </section>
            </div>
        </div>
    );
}
