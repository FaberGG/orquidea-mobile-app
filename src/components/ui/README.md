# src/components/ui/ — Primitivas de interfaz

**Responsabilidad:** bloques básicos de la interfaz, la base del sistema de diseño (Figma).

| Componente previsto | Uso |
|---|---|
| `Button` | Variantes `primary`, `secondary`, `danger`, `link`; estado `loading` y `disabled` |
| `TextField` | Campo con etiqueta, mensaje de error y variante de contraseña |
| `ThemedText` / `ThemedView` | Texto y contenedores con colores del tema |
| `Card` | Contenedor de tarjeta (base de `SpeciesCard`) |
| `ConfirmDialog` | Confirmación de acciones destructivas (eliminar ficha, revocar acceso) |
| `ImagePickerField` | Campo de selección de imagen (presentacional; la lógica de permisos de cámara la aporta quien lo usa) |
| `Collapsible` | Sección expandible (existente, de la plantilla) |

Los integradores con React Hook Form (campos controlados) también pueden vivir aquí si no dependen del dominio.
