# src/components/ — UI compartida

**Responsabilidad:** componentes visuales reutilizables en toda la app, **sin conocimiento del dominio**
(no saben qué es una ficha, un administrador ni un rol).

| Carpeta | Contenido |
|---|---|
| [`ui/`](ui/README.md) | Primitivas: botón, campo de texto, texto temático, tarjeta, diálogo de confirmación |
| [`layout/`](layout/README.md) | Estructura de pantalla: contenedor con área segura, scroll de formulario, encabezado |
| [`feedback/`](feedback/README.md) | Estados: cargando, vacío, error, mensajes de éxito |

## Reglas

- No importan de `features/`, `permissions/` ni `app/`.
- Reciben todo por props; no hacen llamadas a la API ni leen la sesión.
- Usan solo los tokens de `@/constants/theme` (colores, espaciado, fuentes) y soportan tema claro/oscuro.
- Accesibles por defecto (`accessibilityRole`, `accessibilityLabel`, área táctil mínima).
- Un componente sube a esta carpeta cuando **dos o más features** lo necesitan.

> Los archivos actuales en la raíz de esta carpeta (`themed-text`, `themed-view`, `external-link`) vienen de la
> plantilla: los temáticos se reubican en `ui/` y los de demostración (`animated-icon`, `hint-row`, `web-badge`)
> se eliminan en la tarea T0.1 del Sprint 1. La barra inferior de la plantilla (`app-tabs`) fue reemplazada
> por `layout/tab-bar.tsx`.
