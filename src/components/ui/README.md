# src/components/ui/ — Primitivas de interfaz

**Responsabilidad:** bloques básicos de la interfaz, la base del sistema de diseño (Figma).

| Componente previsto | Uso |
|---|---|
| `Button` ✅ (`button.tsx`) | Variantes `primary` y `link` implementadas (`secondary`, `danger` pendientes); estado `isLoading` y `disabled` |
| `TextField` ✅ (`text-field.tsx`) | Campo con etiqueta, borde de error (`hasError`) y variante de contraseña con mostrar/ocultar (`isPassword`) |
| `ThemedText` / `ThemedView` | Texto y contenedores con colores del tema |
| `Card` | Contenedor de tarjeta (base de `SpeciesCard`) |
| `ConfirmDialog` | Confirmación de acciones destructivas (eliminar ficha, revocar acceso) |
| `ImagePickerField` | Campo de selección de imagen (presentacional; la lógica de permisos de cámara la aporta quien lo usa) |
| `Collapsible` | Sección expandible (existente, de la plantilla) |

Los integradores con React Hook Form (campos controlados) también pueden vivir aquí si no dependen del dominio.
