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
  // HU-1.1 CA1 y CA2: el mismo mensaje exista o no la cuenta. Texto de la HU; la API envía un
  // código de 6 dígitos (docs/api B5): ajustarlo si el PO alinea la historia.
  passwordResetRequested:
    'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.',
  // HU-1.1 CA3
  emailRequired: 'Debes ingresar tu correo electrónico.',
  // HU-1.1 paso 2 (reglas del contrato, sin criterio de aceptación: mensajes locales)
  resetRequiredFields: 'Todos los campos son obligatorios.',
  invalidCode: 'El código debe tener 6 dígitos.',
  wrongOrExpiredCode: 'Código incorrecto o vencido.',
  missingResetEmail: 'Vuelve a solicitar el código desde "¿Olvidaste tu contraseña?".',
  passwordResetSuccess: 'Tu contraseña fue actualizada. Inicia sesión con tu nueva contraseña.',
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
  forgotPasswordTitle: 'Recuperar contraseña',
  forgotPasswordSubtitle:
    'Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña',
  // HU-1.1 CA1–CA3: "Clic en el botón ENVIAR."
  sendButton: 'ENVIAR',
  resetPasswordTitle: 'Nueva contraseña',
  resetPasswordSubtitle: 'Escribe el código que enviamos a',
  codeLabel: 'Código de verificación',
  codePlaceholder: '000000',
  newPasswordLabel: 'Nueva contraseña',
  confirmNewPasswordLabel: 'Confirmar nueva contraseña',
  resetButton: 'CAMBIAR CONTRASEÑA',
  noCode: '¿No recibiste el código?',
  resendCode: 'Reenviar',
  rememberedPassword: '¿Recordaste tu contraseña?',
  requestCodeAgain: 'SOLICITAR CÓDIGO',
  accountTitle: 'Mi cuenta',
  accountGuestSubtitle: 'Inicia sesión o crea una cuenta para reportar avistamientos.',
  loginButtonGuest: 'INICIAR SESIÓN',
  roleLabel: 'Rol',
  // HU-3 CA1: "Clic en el botón CERRAR SESIÓN."
  logoutButton: 'CERRAR SESIÓN',
  loginLink: 'Iniciar sesión',
} as const;

/** Nombre visible de cada rol con sesión (solo para mostrar; la UI decide con permisos). */
export const ROLE_LABELS = {
  user: 'Usuario registrado',
  admin: 'Administrador',
  superadmin: 'Superadministrador',
} as const;

/** Claves de caché de la feature. */
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};
