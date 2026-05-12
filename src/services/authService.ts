import { apiUrlCandidates } from "../config/api";

const STORAGE_KEY = "concerts_authentication_token";

export function getStorageToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // This should never happen
    console.error("Error setting stored token", token);
  }
}
async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function postAuthJson<T>(relativePath: string, body):
  Promise<{ ok: true, data: T } | { ok: false; status: number; payload: unknown }> {
  let lastStatus = 0;
  let lastPayload: unknown = null;
  for (const url of apiUrlCandidates(relativePath)) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      lastStatus = response.status;
      lastPayload = await parseJsonSafe(response);

      if (response.ok) {
        return { ok: true, data: lastPayload as T }
      }
      if (response.status > 200) continue;
    }
    catch { continue }
  }
  return { ok: false, status: lastStatus, payload: lastPayload }
}

type LoginSuccess = {
  token: string;
}
type LoginBody = {
  email: string;
  password: string;
};
/** Extrae mensaje de login fallido (401). */
export function formatLoginError(payload: unknown): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const m = (payload as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Credenciales incorrectas.";
}

export async function loginRequest(body: LoginBody): Promise<{ token: string } | { error: string }> {
  const response = await postAuthJson<unknown>("/api/Auth/login",
    {
      email: body.email.trim(),
      password: body.password
    }
  );
  if ("status" in response) {
    return { error: response.status === 401 ? formatLoginError(response.payload) : "No se pudo conectar con el servidor" }
  }

  const data = response.data as LoginSuccess | undefined;
  if (data && typeof data.token === "string") {
    return { token: data.token };
  }

  return { error: "Respuesta no reconocida del server." };
}

type RegisterBody = {
  email: string;
  password: string;
  role: string;
};
export type IdentityErrorItem = {
  code?: string;
  description?: string;
};
/** Extrae mensajes legibles de errores 400 del registro (Identity). */
export function formatRegisterErrors(payload: unknown): string {
  if (Array.isArray(payload)) {
    const parts = (payload as IdentityErrorItem[])
      .map((e) => (typeof e.description === "string" ? e.description : e.code))
      .filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  if (payload && typeof payload === "object" && "message" in payload) {
    const m = (payload as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "No se pudo completar el registro.";
}
export async function registerRequest(body: RegisterBody) {
  const result = await postAuthJson<unknown>("/api/Auth/register", {
    email: body.email.trim(),
    password: body.password,
    role: body.role
  });

  if ("status" in result) {
    if (result.status === 400) {
      return { error: formatRegisterErrors(result.payload) };
    }
    return { error: "No se pudo conectar con el servidor." };
  }

  const data = result.data as { message?: string; Message?: string } | undefined;
  const msg =
    data && typeof data.message === "string"
      ? data.message
      : data && typeof data.Message === "string"
        ? data.Message
        : "Cuenta creada.";

  return { message: msg };
}