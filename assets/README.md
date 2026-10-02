# assets/ — Recursos estáticos

**Responsabilidad:** archivos estáticos empaquetados con la app (imágenes, íconos, fuentes). Se importan con el alias
`@/assets/...`.

| Carpeta | Contenido |
|---|---|
| `images/` | Ícono de la app, splash, íconos adaptativos de Android, imágenes de la UI |
| `images/tabIcons/` | Íconos de las pestañas (`@2x`, `@3x`) |
| `expo.icon/` | Ícono de iOS (formato Icon Composer) |
| `fonts/` | Previsto: tipografías propias si el diseño las define (cargar con `expo-font`) |

## Reglas

- Nombres en `kebab-case`; proveer variantes `@2x` y `@3x` para imágenes rasterizadas de la UI.
- Optimizar las imágenes antes de subirlas (PNG/JPG comprimidos, SVG cuando sea posible).
- Las fotos de especies **no** van aquí: vienen de la API.
- Los íconos y la splash de la plantilla de Expo se reemplazan por la identidad del humedal (configurados en `app.json`).
