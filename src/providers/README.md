# src/providers/ — Providers globales

**Responsabilidad:** componer en un solo lugar los providers de React que envuelven toda la app, en el orden
correcto, para que `src/app/_layout.tsx` solo tenga que montar `<AppProviders>`.

## Contenido previsto

| Archivo | Contenido |
|---|---|
| `app-providers.tsx` | Composición de providers |
| `index.ts` | Exporta `AppProviders` |

Orden previsto (de afuera hacia adentro):

1. `SafeAreaProvider` / `GestureHandlerRootView`
2. `QueryClientProvider` (`@/lib/query`)
3. `SessionProvider` (`@/features/auth`)
4. Provider de rol para `@/permissions` (conecta la sesión con los permisos)
5. `ThemeProvider` (tema claro/oscuro de navegación)

## Reglas

- Aquí no hay lógica de negocio: cada provider se implementa en su feature o en `lib/` y aquí solo se compone.
- Cualquier provider nuevo se agrega aquí y se justifica en el PR.
