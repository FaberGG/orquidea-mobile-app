/** Configuración no secreta derivada, compartida por la infraestructura. */
export const APP_CONFIG = {
  /** Tiempo máximo de espera de una petición HTTP (red móvil inestable en el humedal). */
  requestTimeoutMs: 15_000,
} as const;
