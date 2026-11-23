import { z } from 'zod';

import { deleteSecureItem, getSecureItem, setSecureItem } from '@/lib/storage';

import { type User } from '../types';

const SESSION_USER_KEY = 'orquidea.session-user';

const storedUserSchema = z.object({
  id: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  role: z.enum(['user', 'admin', 'superadmin']),
});

/*
 * Último usuario confirmado por la API, para abrir la app sin conexión con la sesión iniciada (HU-21).
 * Va en el almacenamiento seguro junto al token (ADR-0006): solo los campos de `User`, que son pocos.
 * Solo se usa mientras el token guardado siga vigente; la API sigue siendo la que autoriza.
 *
 * Es una copia de apoyo: un fallo del almacenamiento nunca debe impedir iniciar o cerrar sesión ni abrir la
 * app, por eso estas funciones no lanzan errores (en el peor caso, la sesión no estará disponible sin conexión).
 */

/** Usuario guardado, o `null` si no hay uno válido (un valor inválido se borra). */
export async function getSessionUser(): Promise<User | null> {
  try {
    const raw = await getSecureItem(SESSION_USER_KEY);
    if (raw === null) return null;
    const parsed = storedUserSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
  } catch {
    // JSON inválido o almacenamiento no disponible: se trata como si no hubiera usuario guardado.
  }
  await clearSessionUser();
  return null;
}

/** Guarda el usuario confirmado por la API (inicio de sesión, `GET /yo` o cambio de rol confirmado). */
export async function saveSessionUser(user: User): Promise<void> {
  const { id, firstName, lastName, email, role } = user;
  try {
    await setSecureItem(SESSION_USER_KEY, JSON.stringify({ id, firstName, lastName, email, role }));
  } catch {
    // Sin copia guardada la sesión funciona igual; solo no estará disponible sin conexión.
  }
}

/** Borra el usuario guardado (cierre de sesión, token vencido o sin token). */
export async function clearSessionUser(): Promise<void> {
  try {
    await deleteSecureItem(SESSION_USER_KEY);
  } catch {
    // Sin token vigente el usuario guardado nunca se usa; se vuelve a intentar borrar en el próximo arranque.
  }
}
