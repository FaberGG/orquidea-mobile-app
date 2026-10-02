# src/lib/ — Infraestructura

**Responsabilidad:** adaptadores de librerías externas y servicios técnicos que no conocen el dominio. El resto
de la app usa estas abstracciones en vez de las librerías directamente, para poder cambiarlas en un solo lugar.

| Carpeta | Contenido |
|---|---|
| [`api/`](api/README.md) | Cliente HTTP hacia la API REST |
| [`storage/`](storage/README.md) | Almacenamiento seguro (tokens) y almacenamiento general |
| [`query/`](query/README.md) | Configuración del cliente de caché de servidor (TanStack Query) |

## Reglas

- No importa de `features/`, `permissions/`, `components/` ni `app/`.
- No contiene textos de UI.
- Funciones públicas documentadas con JSDoc breve y cubiertas con pruebas.
