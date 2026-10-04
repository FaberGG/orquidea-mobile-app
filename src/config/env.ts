import { z } from 'zod';

const APP_ENVIRONMENTS = ['development', 'staging', 'production'] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

export type Env = {
  /** URL base de la API REST, sin barra final (las rutas del contrato ya incluyen `/api`). */
  apiUrl: string;
  appEnv: AppEnvironment;
};

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z
    .url({ message: 'EXPO_PUBLIC_API_URL debe ser una URL válida (p. ej. http://localhost:8080).' })
    .refine((value) => !value.endsWith('/'), {
      message: 'EXPO_PUBLIC_API_URL no debe terminar en "/".',
    }),
  EXPO_PUBLIC_APP_ENV: z.enum(APP_ENVIRONMENTS).default('development'),
});

export type RawEnv = {
  EXPO_PUBLIC_API_URL?: string;
  EXPO_PUBLIC_APP_ENV?: string;
};

/**
 * Valida las variables de entorno y las traduce a `Env`.
 * Lanza un error con un mensaje claro si falta alguna obligatoria o tiene un formato inválido.
 */
export function parseEnv(raw: RawEnv): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `- ${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Variables de entorno inválidas. Revisa tu archivo .env.local (ver .env.example):\n${details}`,
    );
  }
  return {
    apiUrl: result.data.EXPO_PUBLIC_API_URL,
    appEnv: result.data.EXPO_PUBLIC_APP_ENV,
  };
}

let cachedEnv: Env | null = null;

/**
 * Devuelve la configuración de entorno validada (se lee una sola vez).
 * Se evalúa de forma perezosa para que las pruebas puedan importar módulos sin definir variables.
 */
export function getEnv(): Env {
  if (cachedEnv === null) {
    // Expo solo inlinea las variables accedidas con notación de punto: no usar corchetes ni desestructurar.
    cachedEnv = parseEnv({
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    });
  }
  return cachedEnv;
}
