import { type Role } from '@/permissions';

/** Usuario con sesión iniciada. El rol lo entrega la API; la app no lo infiere. */
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Rol con sesión: nunca `visitor`. */
  role: Exclude<Role, 'visitor'>;
};
