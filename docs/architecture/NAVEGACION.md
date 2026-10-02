# Navegación

La navegación usa **Expo Router** (rutas basadas en archivos dentro de `src/app/`) y el patrón de
**rutas protegidas** (`Stack.Protected` con la prop `guard`, disponible desde SDK 53).
Referencia: <https://docs.expo.dev/router/advanced/authentication/>

## 1. Árbol de rutas propuesto (Sprint 1)

```
src/app/
├── _layout.tsx                     Providers globales + Stack raíz con guards
│
├── (tabs)/                         Shell principal — TODOS los roles (incluido visitante)
│   ├── _layout.tsx                 Tabs nativas
│   ├── index.tsx                   /            Inicio (opciones según rol — HU-1 CA1)
│   ├── species/
│   │   └── index.tsx               /species     Listado por categoría (HU-10)
│   └── account.tsx                 /account     Visitante: CTA login/registro · Logueado: perfil + cerrar sesión (HU-3)
│
├── species/
│   └── [id].tsx                    /species/:id Detalle de ficha (todos) + acciones admin vía <Can> (HU-8, HU-9)
│
├── (auth)/                         guard: SIN sesión
│   ├── _layout.tsx
│   ├── login.tsx                   /login            HU-1
│   ├── register.tsx                /register         HU-2
│   └── forgot-password.tsx         /forgot-password  HU-1.1
│
└── (admin)/                        guard: can('species:create') → admin y superadmin
    ├── _layout.tsx                 Stack; anida guard de superadmin para admins/
    ├── species/
    │   ├── new.tsx                 /species/new         HU-7
    │   └── [id]/edit.tsx           /species/:id/edit    HU-8
    └── admins/                     guard: can('admins:read') → solo superadmin
        ├── index.tsx               /admins              Listado (HU-5)
        ├── new.tsx                 /admins/new          HU-4
        └── [id].tsx                /admins/:id          Editar / revocar (HU-5)
```

> Los grupos `( )` no agregan segmentos a la URL. Expo Router prioriza rutas estáticas
> (`/species/new`) sobre dinámicas (`/species/[id]`), por lo que no colisionan.

## 2. Guards en el layout raíz (esquema)

```tsx
// src/app/_layout.tsx — esquema ilustrativo, no definitivo
<Stack>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="species/[id]" />

  <Stack.Protected guard={!isAuthenticated}>
    <Stack.Screen name="(auth)" />
  </Stack.Protected>

  <Stack.Protected guard={can('species:create')}>
    <Stack.Screen name="(admin)" />
  </Stack.Protected>
</Stack>
```

Mientras se restaura la sesión guardada (lectura de SecureStore + `GET /me`), la splash screen
permanece visible para evitar parpadeos entre estados de visitante y logueado.

## 3. Comportamiento esperado

| Situación | Resultado |
|---|---|
| Login exitoso (HU-1 CA1) | Se reemplaza la pila y se va a `/` con las opciones del rol |
| Registro exitoso (HU-2 CA1) | Redirige a `/login` |
| Cerrar sesión (HU-3) | Se limpia sesión y caché; se va a `/` como visitante |
| Visitante abre `/species/new` por deep link | El guard lo impide y redirige a la ruta disponible |
| Rol revocado mientras navega (HU-5 CA2) | Al recibir `403` o refrescar `/me`, los guards se reevalúan |

## 4. Reglas

- Navegar con `<Link>` y `router` de `expo-router`; leer parámetros con `useLocalSearchParams`.
- Rutas tipadas (`typedRoutes` está activo): nunca construir rutas con strings concatenados sin tipo.
- Las URLs y nombres de archivo de rutas van en **inglés y kebab-case**; los títulos visibles, en español.
- Los archivos de ruta exportan por defecto un componente que solo renderiza la pantalla de la feature:
  ```tsx
  export { LoginScreen as default } from '@/features/auth';
  ```
- Cualquier cambio en el árbol de rutas debe reflejarse en este documento.
