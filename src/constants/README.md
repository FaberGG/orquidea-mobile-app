# src/constants/ — Tokens de diseño y constantes globales

**Responsabilidad:** valores constantes que usa toda la app.

| Archivo | Estado | Contenido |
|---|---|---|
| `theme.ts` | Existente | `Colors` (claro/oscuro) con la paleta del Figma (`neutro/*`, `green-*`), `FontFamily` (Nunito), `Fonts`, `Spacing`, `Radius`, `MinTouchSize`, `BottomTabInset`, `MaxContentWidth` |

Notas:
- El Figma no define tema oscuro: `Colors.dark` se deriva de las mismas escalas manteniendo contraste AA.
- `danger` / `dangerBackground` no están en el Figma (provisionales).

## Reglas

- Los componentes nunca usan colores o tamaños literales: siempre estos tokens.
- Las constantes de un solo dominio (mensajes, categorías, límites) van en `features/<feature>/constants.ts`, no aquí.
