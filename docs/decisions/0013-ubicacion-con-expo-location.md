# 0013 — Lugar del avistamiento con expo-location

**Estado:** Aceptado

## Contexto

HU-18 pide registrar el "lugar donde lo vi". La API guarda el lugar como coordenadas
(`decimalLatitude`, `decimalLongitude`, opcionales y juntas). El diseño de Figma propone elegir un punto en un
mapa, pero el mapa del sendero (HE-05) aún no existe en la app.

## Decisión

- Usar `expo-location` (módulo oficial de Expo, instalado con `npx expo install`) para tomar la **ubicación
  actual** del teléfono con el botón "Usar mi ubicación actual". Quien reporta suele estar en el humedal.
- Solo se pide permiso **en primer plano** (`requestForegroundPermissionsAsync`). El texto del permiso en iOS se
  configura con el *config plugin* en `app.json`.
- La lógica vive en `src/features/sightings/components/get-current-location.ts`; si el permiso se niega o falla
  el GPS, el campo queda vacío con un mensaje y el reporte se puede enviar sin lugar.
- En el foro, las coordenadas abren la app de mapas con un enlace de Google Maps (sin SDK de mapas).

## Consecuencias

- (+) El usuario registra el lugar con un toque y sin escribir coordenadas.
- (+) Funciona en Expo Go (la ubicación en primer plano está incluida).
- (−) No se puede marcar un lugar distinto de donde está el teléfono. Se resolverá con un selector en el mapa
  cuando exista HE-05 (ver `docs/sprints/he-07-pendientes.md`, A1).
- (−) Cambiar el texto del permiso requiere una nueva build nativa.

## Alternativas consideradas

- `react-native-maps` con selector de punto: más trabajo y duplicaría decisiones que pertenecen a HE-05.
- Pedir latitud y longitud a mano: mala experiencia y propenso a errores.
