# src/features/navigation/ — Shell de navegación

**Responsabilidad:** componer el marco común de la app: el menú lateral y las pestañas inferiores. No es
un dominio propio: reúne las pantallas de otras features (solo por su `index.ts`) y la sesión de
`@/features/auth` para mostrar la identidad del usuario. Las piezas visuales sin dominio (`TabBar`,
`AppHeader`) viven en `src/components/layout/`.

| Archivo | Contenido |
|---|---|
| `components/app-drawer-layout.tsx` | `AppDrawerLayout`: `Drawer` de `expo-router/drawer` (300 px, tipo *front*, velo `scrim`) |
| `components/app-drawer-content.tsx` | `AppDrawerContent`: identidad (iniciales, nombre, correo, rol / visitante con **INICIAR SESIÓN**), sección Gestión de contenido con **Nueva ficha** (`<Can permission="species:create">`) y **Publicar anuncio** (`<Can permission="announcements:publish">`), sección Humedal y sección Administración con `<Can permission="admins:read">` |
| `components/drawer-item.tsx` | `DrawerItem` (fila con ícono; los destinos sin ruta se marcan *Próximamente* y no son presionables) y `DrawerSection` |
| `components/app-tabs-layout.tsx` | `AppTabsLayout`: `Tabs` con `TabBar`, `AppHeader` (abre el menú con `DrawerActions.openDrawer()`) y las 4 pestañas |
| `constants.ts` | `NAVIGATION_LABELS`: etiquetas de pestañas y textos del menú |
| `index.ts` | Exporta los layouts y las etiquetas del shell |

`Gestionar cuentas` abre `/admins` solo con `admins:read`. La ruta de HE-2 se monta como pestaña oculta:
permanece el mismo menú lateral y la misma barra inferior de cuatro destinos.

## Diseño del menú lateral

No existe en Figma; se diseñó con los tokens del sistema: Nunito, íconos Lucide de 22 px en neutro-500,
filas de radio completo como los chips del listado, títulos de sección discretos (sin mayúsculas
sostenidas), avatar con iniciales sobre `primarySoft` (green-50) y el rol en un chip neutro-100. El menú
tiene esquinas derechas de 24 px, igual que la barra inferior.

## Destinos pendientes

| Ítem | HU | Se enlaza cuando… |
|---|---|---|
| Componentes del humedal | HU-14 | exista `features/content` |
| Anuncios | HU-17 | exista `features/content` |
| Descargas sin conexión | HU-21 | se implemente HE-08 |
