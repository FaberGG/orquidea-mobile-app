# scripts/ — Scripts de mantenimiento

**Responsabilidad:** scripts de Node que se ejecutan fuera de la app (automatización del repositorio, generación de
código, utilidades de desarrollo). No se incluyen en el bundle.

| Script | Estado |
|---|---|
| `reset-project.js` | De la plantilla de Expo. **No ejecutar**: mueve `src/` a `example/`. Se elimina en la tarea T0.1 del Sprint 1 |
| `mock-he2-api.cjs` | API efímera para probar login, creación, edición, inhabilitación y revocación de HE-2 |
| `start-he2-demo.cjs` | Inicia la API de prueba y Expo con `npm run demo:he2` |

Para revisar HE-2: ejecuta `npm run demo:he2`, abre `http://localhost:8081` (o pulsa `w` en Expo), inicia
sesión con `superadmin@orquidea.test` / `Prueba123!`, abre el menú izquierdo y entra a **Gestionar cuentas**.
El botón **+** abre HU-4. Toca la fila de Carlos para editarlo, inhabilitarlo o revocarlo (HU-5).
La API de prueba vive solo en memoria: al detener el comando, las cuentas creadas
desaparecen. `admin@orquidea.test` / `Prueba123!` permite comprobar que un administrador no ve esa opción.

Previstos según necesidad: generación de tipos desde el OpenAPI del backend, verificación de variables de entorno.

## Reglas

- Cada script se expone como comando en `package.json` (`npm run <nombre>`) y se documenta aquí.
- Deben ser multiplataforma (Windows, macOS, Linux): usar APIs de Node, no comandos de shell específicos.
