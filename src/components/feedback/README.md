# src/components/feedback/ — Estados y mensajes

**Responsabilidad:** representar de forma uniforme los estados de una pantalla y los mensajes al usuario.
Toda pantalla con datos remotos debe usar estos componentes para **cargando**, **vacío** y **error**.

| Componente previsto | Uso |
|---|---|
| `LoadingState` | Indicador de carga a pantalla completa o en línea |
| `EmptyState` | Mensaje cuando no hay datos (p. ej. `Aún no hay especies registradas en esta categoría.`) |
| `ErrorState` | Error con opción de reintentar |
| `FormMessage` ✅ (`form-message.tsx`) | Mensaje bajo un formulario, variantes `error` (se anuncia como `alert`) y `success` |
| `Toast` | Confirmaciones breves (p. ej. `La ficha se actualizó correctamente.`) |

El texto lo recibe por props: estos componentes no contienen mensajes de dominio.
