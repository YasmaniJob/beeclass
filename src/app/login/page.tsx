
'use client';

import { FormEvent, useState, useEffect, Suspense, useMemo, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppConfig } from '@/hooks/use-app-config';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMatriculaData } from '@/hooks/use-matricula-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, ClipboardList, ChevronLeft, ChevronRight, GraduationCap, LineChart, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { defaultColor } from '@/lib/colors';
import { Checkbox } from '@/components/ui/checkbox';

function ensureHex(color: string | null | undefined) {
    if (!color) return defaultColor;
    const trimmed = color.trim();
    if (!trimmed) return defaultColor;
    return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function lightenHex(hex: string, percent: number) {
    const sanitized = ensureHex(hex).replace('#', '');
    if (sanitized.length !== 6) return ensureHex(hex);
    const num = parseInt(sanitized, 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;

    const lighten = (value: number) => Math.min(255, Math.round(value + (255 - value) * percent));

    const newR = lighten(r);
    const newG = lighten(g);
    const newB = lighten(b);
    const value = (newR << 16) | (newG << 8) | newB;
    return `#${value.toString(16).padStart(6, '0')}`;
}

function hexToRgba(hex: string, alpha: number) {
    const sanitized = ensureHex(hex).replace('#', '');
    if (sanitized.length !== 6) {
        return `rgba(17, 24, 39, ${alpha})`;
    }
    const num = parseInt(sanitized, 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type HeroSlide = {
    title: string;
    description: string;
    type: 'image' | 'illustration';
    icon?: ReactNode;
    image?: string;
    gradient?: string;
};

function LoginContent() {
    const { login, user, isLoaded: isUserLoaded, refreshProfile } = useCurrentUser();
    const { isLoaded: isMatriculaLoaded } = useMatriculaData();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { appName, institutionName, logoUrl, loginImageUrl, themeColor, isLoaded: isAppConfigLoaded } = useAppConfig();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [heroSlideIndex, setHeroSlideIndex] = useState(0);

    const primaryColor = useMemo(() => ensureHex(themeColor), [themeColor]);
    const accentColor = useMemo(() => lightenHex(primaryColor, 0.18), [primaryColor]);
    const overlayStyle = useMemo(() => ({
        backgroundImage: `linear-gradient(140deg, ${hexToRgba(primaryColor, 0.95)} 0%, ${hexToRgba(lightenHex(primaryColor, 0.18), 0.9)} 70%)`,
    }), [primaryColor]);

    const buttonStyle = useMemo(() => ({
        backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
        boxShadow: `0 12px 30px -16px ${hexToRgba(primaryColor, 0.75)}`,
    }), [accentColor, primaryColor]);

    const heroSlides = useMemo<HeroSlide[]>(() => {
        const slides: HeroSlide[] = [];

        if (loginImageUrl) {
            slides.push({
                type: 'image',
                title: 'Tu campus digital',
                description: 'Da la bienvenida al personal con fotografías representativas de la institución.',
                image: loginImageUrl,
            });
        }

        slides.push(
            {
                type: 'illustration',
                title: 'Seguridad Supabase Auth',
                description: 'Las credenciales se cifran y administran automáticamente con políticas institucionales.',
                icon: <ShieldCheck className="h-5 w-5" />,
                gradient: 'from-emerald-500/60 via-teal-500/60 to-slate-900/75',
            },
            {
                type: 'illustration',
                title: 'Monitoreo inteligente',
                description: 'Visualiza métricas de asistencia en tiempo real y detecta tendencias al instante.',
                icon: <LineChart className="h-5 w-5" />,
                gradient: 'from-sky-500/65 via-indigo-500/65 to-slate-900/75',
            },
            {
                type: 'illustration',
                title: 'Identidad institucional',
                description: 'Personaliza el portal con ilustraciones del colegio o mensajes clave para el equipo.',
                icon: <GraduationCap className="h-5 w-5" />,
                gradient: 'from-violet-500/60 via-purple-500/60 to-slate-900/75',
            }
        );

        return slides;
    }, [loginImageUrl]);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!user || !isUserLoaded) {
            setIsRedirecting(false);
            return;
        }

        setIsRedirecting(true);

        if (isMatriculaLoaded) {
            router.replace('/');
        }
    }, [user, isUserLoaded, isMatriculaLoaded, router]);

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

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await login(email, password);
            await refreshProfile().catch(() => undefined);
            toast({
                title: 'Inicio de sesión exitoso',
                description: `Bienvenido/a de nuevo.`,
            });
            setIsRedirecting(true);
        } catch (err: any) {
            setError(err?.message ?? 'No se pudo iniciar sesión. Inténtalo nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAppConfigLoaded || !isUserLoaded) {
        return (
             <div className="flex min-h-screen items-center justify-center bg-background">
                <Skeleton className="h-[450px] w-full max-w-sm" />
            </div>
        )
    }

    if (user) {
        return null;
    }

    const currentSlide = heroSlides[heroSlideIndex] ?? heroSlides[0];

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-6 md:px-8">
            <div className="relative flex h-[min(780px,92vh)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_35px_120px_-45px_rgba(15,23,42,0.45)] ring-1 ring-slate-100/70 md:flex-row">
                <div className="relative flex h-full flex-1 flex-col bg-slate-900 text-white" style={overlayStyle}>
                    <div className="absolute inset-0" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between px-8 pt-8 sm:px-10">
                            <div className="flex items-center gap-4">
                                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10">
                                    {logoUrl ? (
                                        <Image src={logoUrl} alt="Logo institucional" width={48} height={48} className="h-10 w-10 object-contain" />
                                    ) : (
                                        <ShieldCheck className="h-6 w-6" />
                                    )}
                                </span>
                                <div className="space-y-1">
                                    <Badge variant="outline" className="border-white/30 bg-white/10 px-3 text-xs font-medium uppercase tracking-wide text-white/90">
                                        {institutionName || 'Institución educativa'}
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
                                <ShieldCheck className="h-6 w-6 text-slate-500" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-semibold text-slate-900">Bienvenido a {appName}</h1>
                                <p className="text-sm text-slate-500">Ingresa con los datos que tu institución registró para ti.</p>
                            </div>
                        </header>

                        {showSuccess && (
                            <Alert className="border-green-200 bg-green-50 text-green-700">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>¡Registro exitoso!</AlertTitle>
                                <AlertDescription>
                                    Ya puedes iniciar sesión con tu nueva cuenta de administrador.
                                </AlertDescription>
                            </Alert>
                        )}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error de autenticación</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder="director@colegio.edu.pe"
                                    value={email}
                                    onChange={event => setEmail(event.target.value)}
                                    required
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                    Contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={event => setPassword(event.target.value)}
                                    required
                                    className="h-12 rounded-xl border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <label className="flex items-center gap-2 font-medium">
                                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={value => setRememberMe(Boolean(value))} className="rounded-md border-slate-300" />
                                    <span>Recordarme</span>
                                </label>
                                <Link href="#" className="font-medium text-primary hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <Button
                                type="submit"
                                className="group flex w-full items-center justify-center gap-2 rounded-xl border-none py-3 text-base font-semibold text-white shadow-none transition"
                                style={buttonStyle}
                                disabled={!email || !password || isSubmitting || isRedirecting}
                            >
                                {isSubmitting || isRedirecting ? 'Ingresando…' : 'Ingresar'}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </form>

                        <footer className="space-y-4 text-center text-sm text-slate-500">
                            <div className="text-xs">
                                ¿No tienes cuenta?{' '}
                                <Link href="/registro" className="font-semibold text-primary hover:underline">
                                    Regístrate ahora
                                </Link>
                            </div>
                        </footer>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Skeleton className="h-[450px] w-full max-w-sm" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
