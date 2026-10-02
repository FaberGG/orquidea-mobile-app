# scripts/ — Scripts de mantenimiento

**Responsabilidad:** scripts de Node que se ejecutan fuera de la app (automatización del repositorio, generación de
código, utilidades de desarrollo). No se incluyen en el bundle.

| Script | Estado |
|---|---|
| `reset-project.js` | De la plantilla de Expo. **No ejecutar**: mueve `src/` a `example/`. Se elimina en la tarea T0.1 del Sprint 1 |

Previstos según necesidad: generación de tipos desde el OpenAPI del backend, verificación de variables de entorno.

## Reglas

- Cada script se expone como comando en `package.json` (`npm run <nombre>`) y se documenta aquí.
- Deben ser multiplataforma (Windows, macOS, Linux): usar APIs de Node, no comandos de shell específicos.
