import { authenticatedUserDtoSchema, loginResponseDtoSchema } from '../schemas';
import { type ApiRoleDto, type LoginResult, type User } from '../types';

const ROLE_FROM_API: Record<ApiRoleDto, User['role']> = {
  USUARIO_REGISTRADO: 'user',
  ADMINISTRADOR: 'admin',
  SUPERADMINISTRADOR: 'superadmin',
};

/** Valida y traduce `AuthenticatedUserDto` a `User`. Lanza si la respuesta no cumple el contrato. */
export function toUser(dto: unknown): User {
  const parsed = authenticatedUserDtoSchema.parse(dto);
  return {
    id: parsed.id,
    firstName: parsed.nombre,
    lastName: parsed.apellido,
    email: parsed.correo,
    role: ROLE_FROM_API[parsed.rol],
  };
}

/** Valida y traduce `LoginResponse`; el vencimiento se calcula desde `now`. */
export function toLoginResult(dto: unknown, now: number = Date.now()): LoginResult {
  const parsed = loginResponseDtoSchema.parse(dto);
  return {
    token: { token: parsed.token, expiresAt: now + parsed.expiraEnSegundos * 1000 },
    user: toUser(parsed.usuario),
  };
}
