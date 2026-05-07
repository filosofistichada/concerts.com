import { createContext, useCallback, useMemo, useSyncExternalStore, useContext } from "react";
import { getStorageToken, loginRequest, registerRequest, setStoredToken } from "../services/authService";

export type User = {
  email: string | null;
  token: string;
}

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false, error: string }>;
  register: (email: string, password: string, role: string) => Promise<{ ok: true } | { ok: false, error: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_CHANGED_EVENT = "concerts_authentication_changed";

function readToken(): string | null {
  return getStorageToken();
}

function suscribe(callback: () => void) {
  const run = () => callback();
  window.addEventListener("storage", run);
  window.addEventListener(AUTH_CHANGED_EVENT, run);
  return () => {
    window.removeEventListener("storage", run);
    window.removeEventListener(AUTH_CHANGED_EVENT, run);
  }

}

function decodeJwt(token: string): { email: string } | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
// AuthProvider: Proveedor de contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useSyncExternalStore(suscribe, readToken, readToken);

  const user = useMemo((): User => {
    if (!token) return null;
    const payload = decodeJwt(token);
    const email = payload?.email ? payload.email : null;
    return { email, token };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest({ email, password });
    if ("error" in result) return { ok: false as const, error: result.error };
    setStoredToken(result.token);
    notifyAuthChanged();
    return { ok: true as const };
  }, []);
  const register = useCallback(async (email: string, password: string, role: string) => {
    const result = await registerRequest({ email, password, role });
    if ("error" in result) return { ok: false as const, error: result.error };
    return { ok: true as const, message: result.message };
  }, []);
  const logout = useCallback(() => {
    setStoredToken(null);
    notifyAuthChanged();
  }, []);

  const value = useMemo((): AuthContextValue => ({
    user, login, register, logout
  }), [user, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}