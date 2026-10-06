export type CreateAdminInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type CreatedAdmin = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin';
};

/** Forma del JSON de entrada para `RegisterRequest`. */
export type RegisterRequestDto = {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
};
