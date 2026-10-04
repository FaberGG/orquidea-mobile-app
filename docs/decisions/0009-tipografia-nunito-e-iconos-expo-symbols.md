# 0009 — Tipografía Nunito e íconos con expo-symbols

**Estado:** Propuesto

## Contexto

El diseño de Figma "Humedal Orquidea" (sección HE-1) usa la tipografía **Nunito** (Regular, SemiBold y Bold)
e íconos de línea (arroba, asterisco, ojo / ojo tachado) en los campos del login. La app usaba la fuente
del sistema y no tenía librería de íconos.

## Decisión

- Cargar Nunito con `@expo-google-fonts/nunito` (instalado con `npx expo install`) desde `useAppFonts`
  (`src/hooks/`), en el layout raíz. La splash sigue visible hasta que las fuentes cargan; si fallan, la app
  usa la fuente del sistema en vez de bloquearse.
- Los íconos usan `expo-symbols`, que ya estaba en el proyecto: SF Symbols en iOS y Material Symbols en
  Android y web. Se centralizan en `src/components/ui/icon.tsx` con nombres de la app (`email`, `password`…).
- Las familias se referencian con `FontFamily` de `@/constants/theme`, nunca con `fontWeight`
  (en Android combinar ambos puede ignorar la fuente personalizada).

## Consecuencias

- (+) La interfaz coincide con el diseño y los íconos se adaptan al estilo de cada plataforma.
- (+) Sin dependencias nuevas para íconos.
- (−) Una dependencia más (fuentes) y unos cientos de KB en el paquete.
- (−) Los íconos no son los SVG exactos del Figma, sino sus equivalentes de SF/Material Symbols.

## Alternativas consideradas

- `@expo/vector-icons`: otra dependencia, y no se adapta al estilo nativo de iOS.
- Exportar los SVG del Figma con `react-native-svg`: más fiel, pero agrega una dependencia nativa y un
  archivo por ícono y por estado.
