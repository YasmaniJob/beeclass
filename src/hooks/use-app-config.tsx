
'use client';

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { defaultColor, hexToHsl } from '@/lib/colors';
import { Nivel } from '@/lib/definitions';
import { getConfiguracionApp, updateConfiguracionApp, type ConfiguracionApp } from '@/server/actions/configuracion-app';

const DEFAULT_APP_NAME = 'Beeclass';
const DEFAULT_INSTITUTION_NAME = '';
const DEFAULT_LOGO_URL = '';
const DEFAULT_LOGIN_IMAGE_URL = '';
const DEFAULT_NIVEL_INSTITUCION: Nivel = 'Primaria';


interface ConfigData {
    appName: string;
    institutionName: string;
    themeColor: string;
    logoUrl: string;
    loginImageUrl: string;
    nivelInstitucion: Nivel;
}
interface AppConfigContextType extends ConfigData {
    setAppName: (name: string) => void;
    setInstitutionName: (name: string) => void;
    setThemeColor: (color: string) => void;
    setLogoUrl: (url: string) => void;
    setLoginImageUrl: (url: string) => void;
    setNivelInstitucion: (nivel: Nivel) => void;
    saveConfig: (data: ConfigData) => void;
    isLoaded: boolean;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export function AppConfigProvider({ children }: { children: ReactNode }) {
    const [appName, setAppNameState] = useState(DEFAULT_APP_NAME);
    const [institutionName, setInstitutionNameState] = useState(DEFAULT_INSTITUTION_NAME);
    const [themeColor, setThemeColorState] = useState<string>(defaultColor);
    const [logoUrl, setLogoUrlState] = useState(DEFAULT_LOGO_URL);
    const [loginImageUrl, setLoginImageUrlState] = useState(DEFAULT_LOGIN_IMAGE_URL);
    const [nivelInstitucion, setNivelInstitucionState] = useState<Nivel>(DEFAULT_NIVEL_INSTITUCION);
    const [isLoaded, setIsLoaded] = useState(false);

    // Cargar configuración desde la base de datos al montar
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const config = await getConfiguracionApp();
                
                setAppNameState(config.app_name);
                setInstitutionNameState(config.institution_name);
                setThemeColorState(config.theme_color);
                setLogoUrlState(config.logo_url);
                setLoginImageUrlState(config.login_image_url);
                setNivelInstitucionState(config.nivel_institucion as Nivel);
            } catch (error) {
                console.error("Error al cargar configuración. Usando valores por defecto.", error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadConfig();
    }, []);

    const setAppName = (name: string) => setAppNameState(name);
    const setInstitutionName = (name: string) => setInstitutionNameState(name);
    const setThemeColor = (color: string) => setThemeColorState(color);
    const setLogoUrl = (url: string) => setLogoUrlState(url);
    const setLoginImageUrl = (url: string) => setLoginImageUrlState(url);
    const setNivelInstitucion = (nivel: Nivel) => setNivelInstitucionState(nivel);

    const saveConfig = useCallback(async (data: ConfigData) => {
        try {
            // Actualizar en la base de datos
            const result = await updateConfiguracionApp({
                app_name: data.appName,
                institution_name: data.institutionName,
                theme_color: data.themeColor,
                logo_url: data.logoUrl,
                login_image_url: data.loginImageUrl,
                nivel_institucion: data.nivelInstitucion,
            });

            if (result.success) {
                // Actualizar el estado local
                setAppNameState(data.appName);
                setInstitutionNameState(data.institutionName);
                setThemeColorState(data.themeColor);
                setLogoUrlState(data.logoUrl);
                setLoginImageUrlState(data.loginImageUrl);
                setNivelInstitucionState(data.nivelInstitucion);
            } else {
                console.error("Error al guardar configuración:", result.error);
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error al guardar configuración:", error);
            throw error;
        }
    }, []);

    const value = { 
        appName, setAppName, 
        institutionName, setInstitutionName, 
        themeColor, setThemeColor, 
        logoUrl, setLogoUrl,
        loginImageUrl, setLoginImageUrl,
        nivelInstitucion, setNivelInstitucion,
        saveConfig, 
        isLoaded
    };

    return (
        <AppConfigContext.Provider value={value}>
            {children}
        </AppConfigContext.Provider>
    );
}

export const useAppConfig = () => {
    const context = useContext(AppConfigContext);
    if (context === undefined) {
        throw new Error('useAppConfig must be used within an AppConfigProvider');
    }
    return context;
};

export function ThemeUpdater() {
    const { themeColor, isLoaded } = useAppConfig();

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined' || !isLoaded) return;

        const hslColor = hexToHsl(themeColor);
        const root = document.documentElement;
        root.style.setProperty('--primary', hslColor);
        root.style.setProperty('--ring', hslColor);
    }, [themeColor, isLoaded]);

    return null;
}
