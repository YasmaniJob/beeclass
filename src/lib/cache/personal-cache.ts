// src/lib/cache/personal-cache.ts
import { Docente, DocenteInput } from '@/domain/entities/Docente';
import { toDocenteEntity } from '@/domain/mappers/entity-builders';

const CACHE_KEY = 'beeclass_personal_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

interface CacheData {
  data: any[]; // Guardamos como plain objects
  timestamp: number;
  version: string;
}

const CACHE_VERSION = '1.1'; // Incrementado por cambio de estructura

/**
 * Serializa un Docente a un objeto plano para caché
 */
function serializeDocente(docente: Docente): any {
  return {
    tipoDocumento: docente.tipoDocumento,
    numeroDocumento: docente.numeroDocumento,
    apellidoPaterno: docente.apellidoPaterno,
    apellidoMaterno: docente.apellidoMaterno,
    nombres: docente.nombres,
    email: docente.email,
    telefono: docente.telefono,
    rol: docente.rol,
    asignaciones: docente.asignaciones,
    horario: docente.horario,
    personalId: docente.personalId,
  };
}

/**
 * Deserializa un objeto plano a Docente
 */
function deserializeDocente(data: any): Docente | null {
  try {
    const input: DocenteInput = {
      tipoDocumento: data.tipoDocumento,
      numeroDocumento: data.numeroDocumento,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      nombres: data.nombres,
      email: data.email,
      telefono: data.telefono,
      rol: data.rol,
      asignaciones: data.asignaciones || [],
      horario: data.horario,
      personalId: data.personalId,
    };
    
    const result = toDocenteEntity(input);
    return result.isSuccess ? result.value : null;
  } catch (error) {
    console.warn('Error deserializando docente:', error);
    return null;
  }
}

/**
 * Guarda el personal en localStorage con timestamp
 */
export function cachePersonal(personal: Docente[]): void {
  try {
    const serialized = personal.map(serializeDocente);
    const cacheData: CacheData = {
      data: serialized,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error guardando caché de personal:', error);
    clearPersonalCache();
  }
}

/**
 * Obtiene el personal del caché si es válido
 * @returns Personal cacheado o null si no existe o expiró
 */
export function getCachedPersonal(): Docente[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: CacheData = JSON.parse(cached);
    
    // Verificar versión
    if (cacheData.version !== CACHE_VERSION) {
      clearPersonalCache();
      return null;
    }

    // Verificar TTL
    const age = Date.now() - cacheData.timestamp;
    if (age > CACHE_TTL) {
      clearPersonalCache();
      return null;
    }

    // Deserializar a objetos Docente
    const docentes = cacheData.data
      .map(deserializeDocente)
      .filter((d): d is Docente => d !== null);

    return docentes.length > 0 ? docentes : null;
  } catch (error) {
    console.warn('Error leyendo caché de personal:', error);
    clearPersonalCache();
    return null;
  }
}

/**
 * Limpia el caché de personal
 */
export function clearPersonalCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Error limpiando caché de personal:', error);
  }
}

/**
 * Verifica si el caché es válido sin obtener los datos
 */
export function isCacheValid(): boolean {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;

    const cacheData: CacheData = JSON.parse(cached);
    
    if (cacheData.version !== CACHE_VERSION) return false;
    
    const age = Date.now() - cacheData.timestamp;
    return age <= CACHE_TTL;
  } catch {
    return false;
  }
}
