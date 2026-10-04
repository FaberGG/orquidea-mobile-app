// Forma exacta del JSON de la API (docs/api/openapi.json). Solo se usa en ../api.

export type ApiRoleDto = 'USUARIO_REGISTRADO' | 'ADMINISTRADOR' | 'SUPERADMINISTRADOR';

export type AuthenticatedUserDto = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: ApiRoleDto;
};

export type LoginRequestDto = {
  correo: string;
  contrasena: string;
};

export type RegisterRequestDto = {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
};

export type LoginResponseDto = {
  token: string;
  tipo?: string;
  expiraEnSegundos: number;
  usuario: AuthenticatedUserDto;
};
