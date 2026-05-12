/**
 * Decodificación **solo del payload** del JWT (parte central del token en base64).
 * - Sirve para mostrar el email en la UI sin pedir otro endpoint al servidor.
 * - **No sustituye** la validación del token: el backend comprueba firma y expiración.
 * En producción no debes confiar en el payload para decisiones de seguridad en el cliente.
 */
export type JwtPayload = {
    email?: string;
    sub?: string;
    [key: string]: unknown;
  };
  
  export function decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const [, payload] = token.split(".");
      if (!payload) return null;
      const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
      const json = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }
  