# src/components/layout/ — Estructura de pantalla

**Responsabilidad:** componentes que definen el marco común de las pantallas, para que todas tengan márgenes,
áreas seguras y comportamiento de teclado consistentes.

| Componente previsto | Uso |
|---|---|
| `Screen` | Contenedor base: área segura, fondo del tema, ancho máximo en web/tablet |
| `FormScreen` | `Screen` con scroll y manejo del teclado para formularios |
| `ScreenHeader` | Título y acciones opcionales cuando no se usa el header del navegador |
| `Section` | Agrupación con título dentro de una pantalla |
