# src/components/layout/ — Estructura de pantalla

**Responsabilidad:** componentes que definen el marco común de las pantallas, para que todas tengan márgenes,
áreas seguras y comportamiento de teclado consistentes.

| Componente previsto | Uso |
|---|---|
| `Screen` ✅ (`screen.tsx`) | Contenedor base de las pestañas (el encabezado y la barra ya cubren las áreas seguras): fondo del tema y ancho máximo en web/tablet |
| `AppHeader` ✅ (`app-header.tsx`) | Encabezado compartido: menú a la izquierda, título opcional y acción contextual a la derecha; incluye `HeaderIconButton` (círculo de 40 px) |
| `TabBar` ✅ (`tab-bar.tsx`) | Barra inferior del Figma (`bottom-nav`) con cuatro destinos visibles; omite rutas internas con `href: null` |
| `FormScreen` ✅ (`form-screen.tsx`) | Área segura, scroll y manejo del teclado para formularios |
| `Section` | Agrupación con título dentro de una pantalla |
