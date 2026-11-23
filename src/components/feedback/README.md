# src/components/feedback/ — Estados y mensajes

**Responsabilidad:** representar de forma uniforme los estados de una pantalla y los mensajes al usuario.
Toda pantalla con datos remotos debe usar estos componentes para **cargando**, **vacío** y **error**.

| Componente previsto | Uso |
|---|---|
| `LoadingState` | Indicador de carga a pantalla completa o en línea |
| `EmptyState` ✅ (`empty-state.tsx`) | Ícono en círculo de marca, título y descripción (p. ej. `Aún no hay especies registradas en esta categoría.`); acepta una acción como `children` |
| `ErrorState` | Error con opción de reintentar |
| `FormMessage` ✅ (`form-message.tsx`) | Mensaje bajo un formulario, variantes `error` (se anuncia como `alert`) y `success` |
| `Toast` ✅ (`toast.tsx`) | Aviso breve que no bloquea la pantalla: `ToastProvider` (en `AppProviders`) y `useToast().show(mensaje, 'success' \| 'error' \| 'info', { durationMs? })`; aparece arriba con margen y se cierra solo o con su botón X. `info` es neutro (avisos de conexión). Se anuncia a lectores de pantalla (`accessibilityLiveRegion` en Android, `announceForAccessibility` en iOS) |

El texto lo recibe por props: estos componentes no contienen mensajes de dominio.
