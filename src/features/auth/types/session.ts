import { type User } from './user';

/** JWT de la sesión. La API no entrega token de renovación. */
export type AuthToken = {
  token: string;
  /** Vencimiento en milisegundos desde epoch, calculado al recibir `expiraEnSegundos`. */
  expiresAt: number;
};

export type SessionStatus = 'loading' | 'authenticated' | 'guest';

/** Resultado de un inicio de sesión exitoso. */
export type LoginResult = {
  token: AuthToken;
  user: User;
};

/** Datos de registro de un visitante (HU-2). */
export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/** HU-1.1 paso 2: código recibido por correo y nueva contraseña. */
export type PasswordResetData = {
  email: string;
  code: string;
  password: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};
