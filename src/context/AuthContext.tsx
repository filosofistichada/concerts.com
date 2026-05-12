/**
 * Capa de estado global de autenticación (quién está logueado).
 *
 * - **React Context (`AuthContext`)**: Es un “enchufe” compartido. Guardamos el valor
 *   `{ user, login, register, logout }` y cualquier componente hijo puede leerlo sin
 *   pasar props por cada nivel (evita “prop drilling”).
 *
 * - **`AuthProvider`**: Componente que envuelve la app (en `main.tsx`) y **provee** ese valor.
 *   Todo lo que esté dentro puede usar `useAuth()`.
 *
 * - **`useAuth()`**: Hook personalizado que hace `useContext(AuthContext)` y comprueba que
 *   exista el Provider; si lo usas fuera del Provider, lanza error para detectar el fallo pronto.
 *
 * - **`useSyncExternalStore`**: Hook de React pensado para suscribirse a una **fuente externa**
 *   (aquí `localStorage`). Nos asegura que, cuando cambia el token guardado, React vuelva a
 *   renderizar la UI en **modo concurrente** sin inconsistencias.
 *
 * - **Evento personalizado `concerts-auth-changed`**: Al hacer `login` o `logout` escribimos en
 *   `localStorage` desde **esta misma pestaña**. El evento nativo `storage` del navegador
 *   **solo se dispara en otras pestañas**, no en la que guardaste el dato. Por eso definimos
 *   un evento propio y llamamos a `notifyAuthChanged()` después de guardar o borrar el token:
 *   así la NavBar y el resto se actualizan al instante sin recargar la página.
 *
 * - **También escuchamos `storage`**: Si el usuario cierra sesión en otra pestaña, esta se entera
 *   y refresca el estado.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { decodeJwtPayload } from "../lib/jwt";
import { getStorageToken, loginRequest, registerRequest, setStoredToken } from "../services/authService";

/** Usuario “visto” por el front: el JWT trae el email; el token sirve para llamadas autorizadas al API. */
export type User = {
  email: string | null;
  token: string;
};

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (
    email: string,
    password: string,
    role?: string,
  ) => Promise<{ ok: true; message: string } | { ok: false; error: string }>;
  logout: () => void;
};

/** Valor por defecto `null`: indica “aún no hay Provider” hasta que `useAuth` lo detecte. */
const AuthContext = createContext<AuthContextValue | null>(null);
/** Nombre del evento: arbitrario; solo tiene que coincidir entre `dispatchEvent` y `addEventListener`. */
const AUTH_CHANGED_EVENT = "concerts-auth-changed";

/** “Snapshot” actual del token leído de `localStorage` (lo usa `useSyncExternalStore`). */
function readToken(): string | null {
  return getStorageToken();
}


/**
 * Registro de suscriptores para `useSyncExternalStore`: cuando salta `storage` (otras pestañas)
 * o `AUTH_CHANGED_EVENT` (esta pestaña tras login/logout), React vuelve a leer `readToken()`.
 */
function subscribe(callback: () => void) {
  const run = () => callback();
  window.addEventListener("storage", run);
  window.addEventListener(AUTH_CHANGED_EVENT, run);
  return () => {
    window.removeEventListener("storage", run);
    window.removeEventListener(AUTH_CHANGED_EVENT, run);
  };
}

/** Avisa a React en esta pestaña de que el token en `localStorage` acaba de cambiar. */
function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
// AuthProvider: Proveedor de contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useSyncExternalStore(subscribe, readToken, readToken);

  const user = useMemo((): User | null => {
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    const email = typeof payload?.email === "string" ? payload.email : null;
    return { token, email };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest({ email, password });
    if ("error" in result) return { ok: false as const, error: result.error };
    setStoredToken(result.token);
    notifyAuthChanged(); // Sin esto, la misma pestaña no re-renderizaría hasta recargar.
    return { ok: true as const };
  }, []);

  /** El registro solo habla con el API; no guardamos sesión hasta que el usuario haga login. */
  const register = useCallback(async (email: string, password: string, role = "User") => {
    const result = await registerRequest({ email, password, role });
    if ("error" in result) return { ok: false as const, error: result.error };
    return { ok: true as const, message: result.message };
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    notifyAuthChanged();
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
      user,
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para componentes: `const { user, login, logout } = useAuth()`.
 * Solo funciona si el árbol está envuelto en `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
