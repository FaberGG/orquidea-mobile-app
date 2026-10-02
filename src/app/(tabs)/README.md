# src/app/(tabs)/ — Shell principal

**Acceso:** todos los roles, incluido el visitante sin sesión.

**Responsabilidad:** navegador de pestañas inferior que es la base común de la app. Las pantallas son las
mismas para todos los roles; lo que cambia según el rol se resuelve dentro de cada pantalla con permisos
(`<Can>`), no creando pestañas distintas.

## Rutas previstas

| Archivo | URL | Pantalla | HU |
|---|---|---|---|
| `_layout.tsx` | — | Tabs nativas (`expo-router/unstable-native-tabs` o `Tabs`) | — |
| `index.tsx` | `/` | Inicio: accesos según rol | HU-1 CA1 |
| [`species/index.tsx`](species/README.md) | `/species` | Listado de fichas por categoría | HU-10 |
| `account.tsx` | `/account` | Visitante: invitación a iniciar sesión o registrarse. Con sesión: datos del usuario, acceso a gestión de administradores (solo superadmin) y botón **CERRAR SESIÓN** | HU-3 |

Las pestañas de épicas futuras (mapa, anuncios, avistamientos) se agregarán aquí.
