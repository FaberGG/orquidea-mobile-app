# 0010 — Íconos con Lucide

**Estado:** Aceptado. Reemplaza la parte de íconos de [0009](0009-tipografia-nunito-e-iconos-expo-symbols.md)
(la tipografía Nunito se mantiene).

## Contexto

El diseño de Figma "Humedal Orquidea" usa íconos de **Lucide** en todas las secciones: la barra inferior
(`house`, `user-group`, `map`, `circle-user`), el encabezado (`menu`, `search`) y las pantallas de HE-2
(capas "Lucide · save", "Lucide · user-minus"…). ADR-0009 había elegido `expo-symbols`, que muestra
SF Symbols en iOS y Material Symbols en Android/web: los íconos no coincidían con el diseño y cambiaban
de forma según la plataforma.

## Decisión

- Usar `lucide-react-native` (con su dependencia `react-native-svg`), instalados con `npx expo install`.
- Los íconos se siguen centralizando en `src/components/ui/icon.tsx`: las pantallas usan nombres de la app
  (`home`, `community`, `email`…) y solo ese archivo importa de la librería.
- Trazo absoluto de 2 px (`absoluteStrokeWidth`), como los SVG exportados del Figma a 24 y 28 px.
- Se elimina `expo-symbols` del proyecto.
- En Jest, `lucide-react-native` se resuelve a su build CommonJS (`moduleNameMapper` en `package.json`),
  porque la build ESM (`.mjs`) no pasa por el transformador.

## Consecuencias

- (+) Los íconos son los mismos del diseño y se ven igual en iOS, Android y web.
- (+) Catálogo amplio para las épicas siguientes (mapa, avistamientos, contenido).
- (−) Dos dependencias nuevas. `react-native-svg` tiene código nativo, pero viene incluido en Expo Go y
  en las builds de desarrollo de Expo.
- (−) Se pierde la apariencia nativa de SF Symbols en iOS (no era un objetivo del diseño).

## Alternativas consideradas

- **Mantener `expo-symbols`:** sin dependencias nuevas, pero no coincide con el diseño.
- **Exportar los SVG del Figma:** fiel, pero un archivo por ícono y mantenimiento manual.
- **`@expo/vector-icons`:** no incluye el set de Lucide.
