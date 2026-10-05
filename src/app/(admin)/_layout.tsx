import { Stack } from 'expo-router';

/** Rutas de gestión de contenido (admin y superadmin). El acceso lo protege la raíz con `species:create`. */
export default function AdminLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
