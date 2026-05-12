/** Bases absolutas del API (ej. https://localhost:7086), separadas por coma. Vacío = solo proxy `/api` en desarrollo. */
function getConfiguredBaseUrls(): string[] {
    const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
    if (!configured) return [];
    return configured.split(",").map((value) => value.trim()).filter(Boolean);
  }
  
  export const API_BASE_URLS = getConfiguredBaseUrls();
  
  /** Rutas relativas primero (Vite proxy), luego cada base configurada. */
  export function apiUrlCandidates(path: string): string[] {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return [normalized, ...API_BASE_URLS.map((base) => `${base.replace(/\/$/, "")}${normalized}`)];
  }