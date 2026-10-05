# src/features/ — Módulos de dominio

**Responsabilidad:** agrupar todo el código de un dominio funcional (una o varias épicas) en un solo lugar:
pantallas, componentes propios, hooks de datos, llamadas a la API, validaciones y tipos.

## Features

| Feature | Épica | Sprint | Contenido |
|---|---|---|---|
| [`auth/`](auth/README.md) | HE-01 | 1 | Login, registro, recuperación de contraseña, sesión, cierre de sesión |
| [`navigation/`](navigation/README.md) | Shell | 1 | Menú lateral y pestañas inferiores (compone las demás features) |
| [`admins/`](admins/README.md) | HE-02 | 1 | Crear, editar y revocar administradores |
| [`species/`](species/README.md) | HE-03 | 1 | Fichas taxonómicas: listado, detalle, crear, editar, eliminar |
| `qr/` | HE-04 | futuro | Escaneo de QR → ficha |
| [`map/`](map/README.md) | HE-05 | futuro (pestaña creada) | Mapa del sendero y estaciones |
| `content/` | HE-06 | futuro | Componentes del humedal y anuncios |
| [`sightings/`](sightings/README.md) | HE-07 | futuro (pestaña creada) | Reportes ciudadanos y moderación (pestaña Comunidad) |

## Estructura interna estándar

```
<feature>/
├── api/          Funciones que llaman a la API y mapean DTO ⇄ modelo         (<recurso>.api.ts)
├── components/   Pantallas (<Nombre>Screen) y componentes propios del dominio
├── hooks/        Queries/mutations y lógica de pantalla                       (use-<algo>.ts)
├── schemas/      Esquemas de validación de formularios/respuestas            (<nombre>.schema.ts)
├── types/        Modelos de dominio y DTO
├── constants.ts  Mensajes textuales de los criterios de aceptación, claves de caché, límites
└── index.ts      API pública: lo único que se importa desde fuera de la feature
```

No todas las features necesitan todas las carpetas; se crean cuando hacen falta.

## Reglas

1. Desde fuera solo se importa `@/features/<feature>` (el `index.ts`), nunca rutas internas.
2. Una feature puede usar otra solo a través de su `index.ts`. Si la dependencia crece, se extrae a una capa inferior.
3. Las features no importan nada de `src/app/`.
4. Si un componente de una feature lo empiezan a necesitar otras y no tiene lógica de dominio, se mueve a `src/components/`.
5. Cada feature documenta en su README sus pantallas, hooks y endpoints.
