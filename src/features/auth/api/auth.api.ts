import { apiClient } from '@/lib/api';

import {
  type LoginCredentials,
  type LoginRequestDto,
  type LoginResult,
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

/** HU-1 (restaurar sesión): `GET /api/autenticacion/yo` con el token guardado. */
export async function getMe(): Promise<User> {
  const response = await apiClient.get<unknown>('/api/autenticacion/yo');
  return toUser(response);
}
