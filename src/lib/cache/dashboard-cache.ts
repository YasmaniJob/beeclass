// src/lib/cache/dashboard-cache.ts
import { DashboardStats } from '@/hooks/use-dashboard';

const CACHE_KEY = 'beeclass_dashboard_cache';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos (más corto porque los datos cambian frecuentemente)

interface CacheData {
  stats: DashboardStats;
  timestamp: number;
  date: string; // Para invalidar cuando cambia el día
  version: string;
}

const CACHE_VERSION = '1.0';

/**
 * Guarda las stats del dashboard en localStorage
 */
export function cacheDashboardStats(stats: DashboardStats): void {
  try {
    const today = new Date().toDateString();
    const cacheData: CacheData = {
      stats,
      timestamp: Date.now(),
      date: today,
      version: CACHE_VERSION,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error guardando caché de dashboard:', error);
    clearDashboardCache();
  }
}

/**
 * Obtiene las stats del caché si son válidas
 */
export function getCachedDashboardStats(): DashboardStats | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: CacheData = JSON.parse(cached);
    
    // Verificar versión
    if (cacheData.version !== CACHE_VERSION) {
      clearDashboardCache();
      return null;
    }

    // Verificar si cambió el día
    const today = new Date().toDateString();
    if (cacheData.date !== today) {
      clearDashboardCache();
      return null;
    }

    // Verificar TTL
    const age = Date.now() - cacheData.timestamp;
    if (age > CACHE_TTL) {
      clearDashboardCache();
      return null;
    }

    return cacheData.stats;
  } catch (error) {
    console.warn('Error leyendo caché de dashboard:', error);
    clearDashboardCache();
    return null;
  }
}

/**
 * Limpia el caché del dashboard
 */
export function clearDashboardCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Error limpiando caché de dashboard:', error);
  }
}

/**
 * Verifica si el caché es válido
 */
export function isDashboardCacheValid(): boolean {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;

    const cacheData: CacheData = JSON.parse(cached);
    
    if (cacheData.version !== CACHE_VERSION) return false;
    
    const today = new Date().toDateString();
    if (cacheData.date !== today) return false;
    
    const age = Date.now() - cacheData.timestamp;
    return age <= CACHE_TTL;
  } catch {
    return false;
  }
}
