/**
 * Mensajes de HE-01. Los de los criterios de aceptación se copian textualmente de
 * docs/requirements/Historias-Usuario.md; no reescribirlos.
 */
export const AUTH_MESSAGES = {
  // HU-1 CA2
  invalidCredentials: 'Correo o contraseña incorrectos.',
  // HU-1 CA3
  requiredFields: 'Ambos campos son obligatorios.',
  // Respaldo local (CODIGO §10): sin respuesta del servidor o error no previsto.
  networkError: 'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  unexpectedError: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
} as const;

/** Claves de caché de la feature. */
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};
