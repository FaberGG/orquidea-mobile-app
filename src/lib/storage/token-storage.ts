import { deleteSecureItem, getSecureItem, setSecureItem } from './secure-storage';

const TOKEN_KEY = 'orquidea.auth-token';

/** JWT de la sesión y su vencimiento. La API no entrega token de renovación. */
export type StoredToken = {
  token: string;
  /** Momento de vencimiento en milisegundos desde epoch. */
  expiresAt: number;
};

function isStoredToken(value: unknown): value is StoredToken {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.token === 'string' &&
    candidate.token.length > 0 &&
    typeof candidate.expiresAt === 'number'
  );
}

/**
 * Devuelve el token guardado si existe y no ha vencido.
 * Un token vencido o con formato inválido se borra y se devuelve `null`.
 */
export async function getToken(now: number = Date.now()): Promise<StoredToken | null> {
  const raw = await getSecureItem(TOKEN_KEY);
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  if (!isStoredToken(parsed) || parsed.expiresAt <= now) {
    await deleteSecureItem(TOKEN_KEY);
    return null;
  }
  return parsed;
}

/** Guarda el token de la sesión en el almacenamiento seguro. */
export async function saveToken(token: StoredToken): Promise<void> {
  await setSecureItem(TOKEN_KEY, JSON.stringify(token));
}

/** Borra el token de la sesión (cierre de sesión o token vencido). */
export async function clearToken(): Promise<void> {
  await deleteSecureItem(TOKEN_KEY);
}
