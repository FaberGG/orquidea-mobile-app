# Orquídea — App móvil del Humedal

Aplicación móvil (Android / iOS / Web) del **Humedal La Orquídea**. Permite a los visitantes
conocer la biodiversidad del humedal mediante fichas taxonómicas, mapa del sendero, contenido
educativo y reportes ciudadanos de avistamientos; y a los administradores gestionar ese contenido.

La app es un **cliente de una API REST**: no contiene lógica de negocio autoritativa. Toda regla
de seguridad (roles, límites, validaciones finales) la aplica el backend; la app la refleja en la UI.

> Requisitos funcionales: [`docs/requirements/Historias-Usuario.md`](docs/requirements/Historias-Usuario.md)

---

## Stack

| Área | Tecnología |
|---|---|
| Framework | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) + React Native 0.86 + React 19 |
| Lenguaje | TypeScript (modo `strict`) |
| Navegación | [Expo Router](https://docs.expo.dev/router/introduction/) (rutas por archivos en `src/app/`) |
| Compilador | React Compiler activado (`experiments.reactCompiler` en `app.json`) |
| Builds / OTA | [EAS](https://docs.expo.dev/eas/) (Continuous Native Generation: **no** se versionan `ios/` ni `android/`) |

Las librerías planeadas (estado de servidor, formularios, almacenamiento seguro, pruebas, etc.)
y el porqué de cada una están en [`docs/decisions/`](docs/decisions/README.md).

---

## Requisitos previos

- **Node.js 22 LTS** (versión fijada en `.nvmrc`) y **npm** (el proyecto usa `package-lock.json`; no mezclar con yarn/pnpm/bun).
- **Git**.
- Para probar en dispositivo: app **Expo Go** o un *development build* (ver abajo).
- Opcional: Android Studio (emulador) o Xcode (simulador, solo macOS).

## Puesta en marcha

```bash
git clone <url-del-repo>
cd orquidea-mobile-app
npm install
cp .env.example .env.local     # y ajusta EXPO_PUBLIC_API_URL
npx expo start                 # la primera ejecución genera expo-env.d.ts (necesario para typecheck)
```

> Usa la versión de Node indicada en `.nvmrc` (`nvm use`). En VS Code instala las extensiones
> recomendadas (ESLint, Prettier, EditorConfig): el formato se aplica al guardar.

### Calidad automática

| Cuándo | Qué se ejecuta | Configuración |
|---|---|---|
| Al guardar (VS Code) | Prettier + correcciones de ESLint | `.vscode/settings.json` |
| Pull Request / push a `main` o `develop` | Lint, formato y tipos | `.github/workflows/ci.yml` |

En la terminal de Expo: `a` abre Android, `i` abre iOS, `w` abre web, o escanea el QR con Expo Go.

> **Expo Go vs development build:** Expo Go solo incluye los módulos nativos del SDK. Si se agrega
> una librería con código nativo que no esté en Expo Go, hay que usar un development build:
> `npx expo run:android` / `npx expo run:ios` o `npx eas-cli@latest build --profile development`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Inicia el servidor de desarrollo (Metro) |
| `npm run android` / `ios` / `web` | Inicia y abre en la plataforma indicada |
| `npm run lint` / `lint:fix` | ESLint (`expo lint`): reglas de Expo, orden de imports y fronteras entre capas |
| `npm run format` / `format:check` | Prettier: formatea / verifica el formato |
| `npm run typecheck` | Verificación de tipos (`tsc --noEmit`) |
| `npx expo install <paquete>` | **Única forma permitida** de agregar dependencias (resuelve versiones compatibles con el SDK) |
| `npx expo install --fix` | Corrige versiones incompatibles |
| `npx expo-doctor` | Diagnóstico de configuración y dependencias |

> ⚠️ No ejecutar `npm run reset-project`: es un script de la plantilla que mueve `src/` a `example/`
> y destruiría la estructura del proyecto. Se elimina en la tarea de limpieza del Sprint 1.

## Variables de entorno

Se definen en `.env.local` (no versionado) a partir de [`.env.example`](.env.example).
Solo las variables con prefijo `EXPO_PUBLIC_` llegan a la app y **quedan visibles en el binario**:
nunca colocar secretos ahí. Detalle en [`src/config/README.md`](src/config/README.md).

---

## Estructura del proyecto

```
.
├── assets/                 # Imágenes, íconos y fuentes estáticas
├── docs/                   # Requisitos, arquitectura, convenciones, decisiones y sprints
├── scripts/                # Scripts de mantenimiento (Node)
├── src/
│   ├── app/                # SOLO rutas (Expo Router). Pantallas delgadas
│   ├── features/           # Módulos de dominio: auth, admins, species, ...
│   ├── components/         # UI compartida y agnóstica del dominio
│   ├── permissions/        # Roles, matriz de permisos, <Can/> y usePermission
│   ├── providers/          # Composición de providers globales
│   ├── lib/                # Infraestructura: cliente HTTP, almacenamiento seguro, query client
│   ├── hooks/              # Hooks globales no ligados a un dominio
│   ├── config/             # Lectura y validación de configuración/entorno
│   ├── constants/          # Tema (colores, espaciado, fuentes) y constantes globales
│   ├── types/              # Tipos globales compartidos
│   └── utils/              # Funciones puras reutilizables
├── .github/                # CI (workflows) y plantillas de PR e issues
├── AGENTS.md               # Instrucciones para agentes de IA
└── CONTRIBUTING.md         # Cómo colaborar: ramas, commits, PRs
```

Cada directorio tiene su propio `README.md` que explica su responsabilidad y qué se implementa ahí.
La explicación completa de capas y reglas de dependencia está en
[`docs/architecture/ARQUITECTURA.md`](docs/architecture/ARQUITECTURA.md).

## Documentación

| Documento | Contenido |
|---|---|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Flujo de trabajo, ramas, commits, PRs, Definition of Done |
| [docs/api/](docs/api/README.md) | Contrato de la API (OpenAPI) y brechas con las historias |
| [docs/architecture/ARQUITECTURA.md](docs/architecture/ARQUITECTURA.md) | Capas, flujo de datos, integración con la API |
| [docs/architecture/ROLES-Y-PERMISOS.md](docs/architecture/ROLES-Y-PERMISOS.md) | Modelo de roles y cómo una misma pantalla varía según el rol |
| [docs/architecture/NAVEGACION.md](docs/architecture/NAVEGACION.md) | Mapa de rutas y rutas protegidas |
| [docs/conventions/CODIGO.md](docs/conventions/CODIGO.md) | Reglas de codificación y buenas prácticas |
| [docs/conventions/GIT.md](docs/conventions/GIT.md) | Convención de ramas y commits |
| [docs/decisions/](docs/decisions/README.md) | Registro de decisiones de arquitectura (ADR) |
| [docs/sprints/sprint-01.md](docs/sprints/sprint-01.md) | Alcance y plan del Sprint 1 (HE-01 a HE-03) |

## Licencia

Ver [LICENSE](LICENSE).
