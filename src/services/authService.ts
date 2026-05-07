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
      lastPayload = response.text;

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
export async function loginRequest(body: LoginBody): Promise<{ token: string } | { error: string }> {
  const response = await postAuthJson<unknown>("/api/Auth/login",
    {
      email: body.email.trim(),
      password: body.password
    }
  );
  if ("status" in response) {
    if (response.status === 400) {
      return { error: "Usuario no enontrado correctamente" }
    }
    return { error: "No se pudo conectar con el servidor" }
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
export async function registerRequest(body: RegisterBody) {
  const result = await postAuthJson<unknown>("/api/Auth/register", {
    email: body.email.trim(),
    password: body.password,
    role: body.role
  });

  if ("status" in result) {
    if (result.status === 400) {
      return { error: "Usuario no subido correctamente" }
    }
    return { error: "No se pudo conectar con el servidor" }
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