import { Stack } from 'expo-router';

export default function AuthLayout() {
  // El diseño de HE-1 no tiene encabezado de navegación: cada pantalla tiene su enlace de vuelta
  // en el pie y se puede volver con el gesto o botón atrás del sistema.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
