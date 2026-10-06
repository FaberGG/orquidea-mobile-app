# Navegación

La navegación usa **Expo Router** (rutas basadas en archivos dentro de `src/app/`) y el patrón de
**rutas protegidas** (`Stack.Protected` con la prop `guard`, disponible desde SDK 53).
Referencia: <https://docs.expo.dev/router/advanced/authentication/>

## 1. Árbol de rutas (Sprint 1)

```
src/app/
├── _layout.tsx                     Providers globales + Stack raíz con guards
│
├── (drawer)/                       Menú lateral — TODOS los roles (incluido visitante)
│   ├── _layout.tsx                 Drawer (AppDrawerLayout de @/features/navigation)
│   └── (tabs)/                     Barra inferior — mismas 4 pestañas para todos los roles
│       ├── _layout.tsx             Tabs con TabBar y AppHeader propios (Figma: "Listar fichas")
│       ├── index.tsx               /            Inicio: listado de fichas taxonómicas (HU-10)
│       ├── community.tsx           /community   Comunidad: avistamientos (HU-18, HU-19, HU-20)
│       ├── map.tsx                 /map         Mapas: mapa del sendero (HU-12, HU-13)
│       ├── account.tsx             /account     Usuario: visitante → iniciar sesión · con sesión → datos, rol y cerrar sesión (HU-3)
│       └── admins/                /admins      Ruta oculta de la barra inferior; gestión HE-2 (solo superadmin)
│
├── species/
│   └── [id].tsx                    /species/:id Detalle de ficha (todos) + acciones admin vía <Can> (HU-8, HU-9)
│
├── (auth)/                         guard: SIN sesión
│   ├── _layout.tsx
│   ├── login.tsx                   /login            HU-1
│   ├── register.tsx                /register         HU-2
│   ├── forgot-password.tsx         /forgot-password  HU-1.1 paso 1: solicitar código
│   └── reset-password.tsx          /reset-password   HU-1.1 paso 2: código + nueva contraseña
│
└── (admin)/                        guard: can('species:create') → admin y superadmin
    ├── _layout.tsx                 Stack; anida guard de superadmin para admins/
    ├── species/
    │   ├── new.tsx                 /species/new         HU-7
    │   └── [id]/edit.tsx           /species/:id/edit    HU-8
    └── admins/                     reservado en la arquitectura; HE-2 vive actualmente bajo (drawer)/(tabs)
```

> Los grupos `( )` no agregan segmentos a la URL. Expo Router prioriza rutas estáticas
> (`/species/new`) sobre dinámicas (`/species/[id]`), por lo que no colisionan.

### Barra inferior y menú lateral

| Lugar | Contenido | Acceso |
|---|---|---|
| Barra inferior | Inicio · Comunidad · Mapas · Usuario | Todos los roles (las pestañas no cambian con el rol) |
| Encabezado de las pestañas | Botón de menú (abre el menú lateral); acción opcional a la derecha (p. ej. buscar en Inicio) | Todos |
| Menú lateral: identidad | Usuario: iniciales, nombre, correo y rol (lleva a `/account`). Visitante: botón **INICIAR SESIÓN** | Todos |
| Menú lateral: Humedal | Componentes del humedal (HU-14), Anuncios (HU-17), Descargas sin conexión (HU-21) — *Próximamente* | Todos |
| Menú lateral: Administración | Gestionar cuentas abre `/admins`; creación HU-4 y gestión HU-5 | `<Can permission="admins:read">` |

Lo que depende del rol dentro de cada pestaña se resuelve con `<Can>` en la propia pantalla
(p. ej. **Crear ficha** en Inicio, revisar reportes en Comunidad, gestionar estaciones en Mapas).
Los destinos del menú marcados *Próximamente* se enlazan cuando exista su ruta.

## 2. Guards en el layout raíz (esquema)

```tsx
// src/app/_layout.tsx — esquema ilustrativo, no definitivo
<Stack>
  <Stack.Screen name="(drawer)" />
  <Stack.Screen name="species/[id]" />

  <Stack.Protected guard={!isAuthenticated}>
    <Stack.Screen name="(auth)" />
  </Stack.Protected>

  <Stack.Protected guard={can('species:create')}>
    <Stack.Screen name="(admin)" />
  </Stack.Protected>
</Stack>
```

Mientras se restaura la sesión guardada (lectura de SecureStore + `GET /api/autenticacion/yo`), la splash screen
permanece visible para evitar parpadeos entre estados de visitante y logueado.

## 3. Comportamiento esperado

| Situación | Resultado |
|---|---|
| Login exitoso (HU-1 CA1) | Se reemplaza la pila y se va a `/` con las opciones del rol |
| Registro exitoso (HU-2 CA1) | Redirige a `/login` |
| Código de recuperación solicitado (HU-1.1) | Va a `/reset-password` con el correo como parámetro |
| Contraseña restablecida (HU-1.1) | Redirige a `/login` |
| Token vencido (`401` en una petición autenticada) | Se borra el token y la sesión pasa a visitante; los guards redirigen |
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
