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

export type LoginCredentials = {
  email: string;
  password: string;
};
