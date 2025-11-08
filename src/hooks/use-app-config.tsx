
'use client';

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { defaultColor, hexToHsl } from '@/lib/colors';
import { Nivel } from '@/lib/definitions';

const APP_NAME_KEY = 'app_config_name';
const APP_INSTITUTION_NAME_KEY = 'app_config_institution_name';
const THEME_COLOR_KEY = 'app_config_theme_color';
const LOGO_URL_KEY = 'app_config_logo_url';
const LOGIN_IMAGE_URL_KEY = 'app_config_login_image_url';
const NIVEL_INSTITUCION_KEY = 'app_config_nivel_institucion';

const DEFAULT_APP_NAME = 'AsistenciaFácil';
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

function AppConfigInitializer({ onLoaded }: { onLoaded: () => void }) {
    const {
        setAppName,
        setInstitutionName,
        setThemeColor,
        setLogoUrl,
        setLoginImageUrl,
        setNivelInstitucion,
    } = useAppConfig();

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') {
            onLoaded();
            return;
        }

        try {
            const storedName = localStorage.getItem(APP_NAME_KEY);
            const storedInstitutionName = localStorage.getItem(APP_INSTITUTION_NAME_KEY);
            const storedColor = localStorage.getItem(THEME_COLOR_KEY);
            const storedLogoUrl = localStorage.getItem(LOGO_URL_KEY);
            const storedLoginImageUrl = localStorage.getItem(LOGIN_IMAGE_URL_KEY);
            const storedNivel = localStorage.getItem(NIVEL_INSTITUCION_KEY) as Nivel | null;

            if (storedName) setAppName(storedName);
            if (storedInstitutionName) setInstitutionName(storedInstitutionName);
            if (storedColor) setThemeColor(storedColor);
            if (storedLogoUrl) setLogoUrl(storedLogoUrl);
            if (storedLoginImageUrl) setLoginImageUrl(storedLoginImageUrl);
            if (storedNivel) setNivelInstitucion(storedNivel);

        } catch (error) {
            console.error("Could not access localStorage. Using default values.");
        } finally {
            onLoaded();
        }
    }, [setAppName, setInstitutionName, setThemeColor, setLogoUrl, setLoginImageUrl, setNivelInstitucion, onLoaded]);

    return null;
}

export function AppConfigProvider({ children }: { children: ReactNode }) {
    const [appName, setAppNameState] = useState(DEFAULT_APP_NAME);
    const [institutionName, setInstitutionNameState] = useState(DEFAULT_INSTITUTION_NAME);
    const [themeColor, setThemeColorState] = useState<string>(defaultColor);
    const [logoUrl, setLogoUrlState] = useState(DEFAULT_LOGO_URL);
    const [loginImageUrl, setLoginImageUrlState] = useState(DEFAULT_LOGIN_IMAGE_URL);
    const [nivelInstitucion, setNivelInstitucionState] = useState<Nivel>(DEFAULT_NIVEL_INSTITUCION);
    const [isLoaded, setIsLoaded] = useState(false);

    const setAppName = (name: string) => setAppNameState(name);
    const setInstitutionName = (name: string) => setInstitutionNameState(name);
    const setThemeColor = (color: string) => setThemeColorState(color);
    const setLogoUrl = (url: string) => setLogoUrlState(url);
    const setLoginImageUrl = (url: string) => setLoginImageUrlState(url);
    const setNivelInstitucion = (nivel: Nivel) => setNivelInstitucionState(nivel);

    const saveConfig = useCallback((data: ConfigData) => {
        // Only save to localStorage on client side
        if (typeof window === 'undefined') {
            // Just update state on server side
            setAppNameState(data.appName);
            setInstitutionNameState(data.institutionName);
            setThemeColorState(data.themeColor);
            setLogoUrlState(data.logoUrl);
            setLoginImageUrlState(data.loginImageUrl);
            setNivelInstitucionState(data.nivelInstitucion);
            return;
        }

        try {
            localStorage.setItem(APP_NAME_KEY, data.appName);
            localStorage.setItem(APP_INSTITUTION_NAME_KEY, data.institutionName);
            localStorage.setItem(THEME_COLOR_KEY, data.themeColor);
            localStorage.setItem(LOGO_URL_KEY, data.logoUrl);
            localStorage.setItem(LOGIN_IMAGE_URL_KEY, data.loginImageUrl);
            localStorage.setItem(NIVEL_INSTITUCION_KEY, data.nivelInstitucion);

            setAppNameState(data.appName);
            setInstitutionNameState(data.institutionName);
            setThemeColorState(data.themeColor);
            setLogoUrlState(data.logoUrl);
            setLoginImageUrlState(data.loginImageUrl);
            setNivelInstitucionState(data.nivelInstitucion);

        } catch (error) {
            console.error("Could not save settings to localStorage.");
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
            <AppConfigInitializer onLoaded={() => setIsLoaded(true)} />
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
