import { apiClient } from '@/lib/api';

import {
  type LoginCredentials,
  type LoginRequestDto,
  type LoginResult,
  type PasswordRecoveryRequestDto,
  type PasswordResetData,
  type PasswordResetRequestDto,
  type RegisterData,
  type RegisterRequestDto,
  type User,
} from '../types';
import { toLoginResult, toUser } from './auth.mappers';

/** HU-1: `POST /api/autenticacion/iniciar-sesion`. Un `401` aquí son credenciales incorrectas. */
export async function login({ email, password }: LoginCredentials): Promise<LoginResult> {
  const body: LoginRequestDto = { correo: email.trim(), contrasena: password };
  const response = await apiClient.post<unknown>('/api/autenticacion/iniciar-sesion', {
    body,
    authenticated: false,
  });
  return toLoginResult(response);
}

/**
 * HU-2: `POST /api/autenticacion/registro`. Crea un usuario registrado; no inicia sesión
 * (el criterio de aceptación pide volver al login). `409` = correo ya registrado.
 */
export async function register({
  firstName,
  lastName,
  email,
  password,
}: RegisterData): Promise<void> {
  const body: RegisterRequestDto = {
    nombre: firstName.trim(),
    apellido: lastName.trim(),
    correo: email.trim(),
    contrasena: password,
  };
  await apiClient.post<unknown>('/api/autenticacion/registro', { body, authenticated: false });
}

/**
 * HU-1.1 paso 1: `POST /api/autenticacion/recuperar-contrasena`. La API envía un código de
 * 6 dígitos y responde igual exista o no la cuenta (204).
 */
export async function requestPasswordReset({ email }: { email: string }): Promise<void> {
  const body: PasswordRecoveryRequestDto = { correo: email.trim() };
  await apiClient.post<unknown>('/api/autenticacion/recuperar-contrasena', {
    body,
    authenticated: false,
  });
}

/** HU-1.1 paso 2: `POST /api/autenticacion/restablecer-contrasena`. `400` = código incorrecto o vencido. */
export async function resetPassword({ email, code, password }: PasswordResetData): Promise<void> {
  const body: PasswordResetRequestDto = {
    correo: email.trim(),
    codigo: code,
    contrasena: password,
  };
  await apiClient.post<unknown>('/api/autenticacion/restablecer-contrasena', {
    body,
    authenticated: false,
  });
}

/** HU-1 (restaurar sesión): `GET /api/autenticacion/yo` con el token guardado. */
export async function getMe(): Promise<User> {
  const response = await apiClient.get<unknown>('/api/autenticacion/yo');
  return toUser(response);
}
