/**
 * Mensajes de HE-01. Los de los criterios de aceptación se copian textualmente de
 * docs/requirements/Historias-Usuario.md; no reescribirlos.
 */
export const AUTH_MESSAGES = {
  // HU-1 CA2
  invalidCredentials: 'Correo o contraseña incorrectos.',
  // HU-1 CA3
  requiredFields: 'Ambos campos son obligatorios.',
  // HU-2 CA2
  emailAlreadyRegistered: 'Este correo ya está registrado.',
  // HU-2 CA3
  registerRequiredFields: 'Todos los campos son obligatorios.',
  // HU-2 CA4
  invalidEmail: 'Ingresa un correo electrónico válido.',
  // HU-2: reglas del contrato y del diseño que la HU no menciona (mensajes locales).
  nameTooShort: 'El nombre y el apellido deben tener al menos 2 caracteres.',
  passwordsDoNotMatch: 'Las contraseñas no coinciden.',
  termsNotAccepted: 'Debes aceptar los términos y condiciones y la política de privacidad.',
  // HU-2 CA1: confirmación al volver al login (el backend envía el correo de confirmación).
  registerSuccess: 'Tu cuenta fue creada. Revisa tu correo e inicia sesión.',
  // Respaldo local (CODIGO §10): sin respuesta del servidor o error no previsto.
  networkError: 'No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  unexpectedError: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
} as const;

/**
 * Textos de la interfaz de HE-01. Los marcados con CA vienen de los criterios de aceptación y
 * prevalecen sobre el Figma cuando difieren (el diseño dice "Iniciar Sesion" y "Olvido su contraseña?").
 */
export const AUTH_LABELS = {
  loginTitle: 'Iniciar Sesión',
  loginSubtitle: 'Por favor, ingresa tus credenciales para continuar',
  emailLabel: 'Correo electrónico',
  emailPlaceholder: 'ejemplo@gmail.com',
  passwordLabel: 'Contraseña',
  passwordPlaceholder: '*********',
  // HU-1 CA1–CA3: "Clic en el botón INGRESAR."
  loginButton: 'INGRESAR',
  // HU-1 CA4
  forgotPasswordLink: '¿Olvidaste tu contraseña?',
  noAccount: '¿No tiene una cuenta?',
  registerLink: 'Registrarse',
  registerTitle: 'Registrarse',
  registerSubtitle: 'Por favor, ingresa tus datos para continuar con el registro',
  firstNameLabel: 'Nombre',
  firstNamePlaceholder: 'Ingresa tu nombre',
  lastNameLabel: 'Apellido',
  lastNamePlaceholder: 'Ingresa tu apellido',
  confirmPasswordLabel: 'Confirmar contraseña',
  acceptTermsPrefix: 'Aceptar ',
  termsAndConditions: 'términos y condiciones',
  privacyPolicy: 'política de privacidad',
  // HU-2 CA1–CA4: "Clic en el botón REGISTRARME."
  registerButton: 'REGISTRARME',
  hasAccount: '¿Ya tienes una cuenta?',
  loginLink: 'Iniciar sesión',
} as const;

/** Claves de caché de la feature. */
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};
