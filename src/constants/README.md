# src/constants/ — Tokens de diseño y constantes globales

**Responsabilidad:** valores constantes que usa toda la app.

| Archivo | Estado | Contenido |
|---|---|---|
| `theme.ts` | Existente | `Colors` (claro/oscuro), `Fonts`, `Spacing`, `BottomTabInset`, `MaxContentWidth` |

Previsto:
- Ajustar `Colors` y tipografías a la identidad visual del humedal cuando esté el diseño en Figma
  (agregar colores semánticos: `primary`, `danger`, `success`, `border`).
- `Radius` y escala tipográfica si el diseño las define.

## Reglas

- Los componentes nunca usan colores o tamaños literales: siempre estos tokens.
- Las constantes de un solo dominio (mensajes, categorías, límites) van en `features/<feature>/constants.ts`, no aquí.
