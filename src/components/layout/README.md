# src/components/layout/ — Estructura de pantalla

**Responsabilidad:** componentes que definen el marco común de las pantallas, para que todas tengan márgenes,
áreas seguras y comportamiento de teclado consistentes.

| Componente previsto | Uso |
|---|---|
| `Screen` ✅ (`screen.tsx`) | Contenedor base de las pestañas (el encabezado y la barra ya cubren las áreas seguras): fondo del tema y ancho máximo en web/tablet |
| `AppHeader` ✅ (`app-header.tsx`) | Encabezado de las pestañas (Figma "Listar fichas"): botón de menú y acción opcional a la derecha; incluye `HeaderIconButton` (círculo de 40 px) |
| `TabBar` ✅ (`tab-bar.tsx`) | Barra inferior del Figma (`bottom-nav`): fondo neutro-100, esquinas superiores de 24 px, ícono de 28 px y etiqueta; activa en green-700 |
| `FormScreen` ✅ (`form-screen.tsx`) | Área segura, scroll y manejo del teclado para formularios |
| `Section` | Agrupación con título dentro de una pantalla |
