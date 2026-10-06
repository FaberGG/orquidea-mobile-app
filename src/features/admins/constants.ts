/** Mensajes de HU-4: los criterios de aceptación prevalecen sobre el texto del prototipo. */
export const ADMIN_MESSAGES = {
  requiredFields: 'Debes completar todos los campos obligatorios.',
  invalidEmail: 'Ingresa un correo electrónico válido.',
  passwordMismatch: 'Las contraseñas no coinciden.',
  duplicateEmail: 'Este correo ya está registrado.',
  limitReached:
    'Has alcanzado el número de administradores configurado. Contacta al equipo de desarrollo si necesitas ampliarlo.',
  created: 'Administrador creado correctamente.',
  networkError: 'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  unexpectedError: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  listUnavailable:
    'El listado de administradores estará disponible cuando el servidor permita consultarlo.',
} as const;

export const ADMIN_LABELS = {
  title: 'Crear administrador',
  subtitle: 'La cuenta tendrá acceso de administrador a Orquídea.',
  firstName: 'Nombre',
  lastName: 'Apellido',
  email: 'Correo electrónico',
  password: 'Contraseña',
  confirmPassword: 'Confirmar contraseña',
  role: 'Rol: Administrador',
  create: 'CREAR ADMINISTRADOR',
  createAnother: 'CREAR OTRO ADMINISTRADOR',
  back: 'VOLVER A ADMINISTRADORES',
  listTitle: 'Administradores',
  createAction: 'Agregar administrador',
} as const;
