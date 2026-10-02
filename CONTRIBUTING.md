# Guía de contribución

Gracias por colaborar en Orquídea. Este documento resume **cómo se trabaja** en el repositorio.
Las reglas detalladas viven en:

- Código: [`docs/conventions/CODIGO.md`](docs/conventions/CODIGO.md)
- Ramas y commits: [`docs/conventions/GIT.md`](docs/conventions/GIT.md)
- Arquitectura: [`docs/architecture/ARQUITECTURA.md`](docs/architecture/ARQUITECTURA.md)

---

## 1. Antes de empezar

1. Sigue la sección *Puesta en marcha* del [README](README.md).
2. Lee la historia de usuario (HU) que vas a implementar en
   [`docs/requirements/Historias-Usuario.md`](docs/requirements/Historias-Usuario.md).
   Los **criterios de aceptación son el contrato**: los mensajes que muestra el sistema deben
   coincidir textualmente.
3. Revisa el README del directorio donde vas a trabajar (`src/features/<feature>/README.md`, etc.).

## 2. Flujo de trabajo

```
develop ──┬──────────────────────────────┬──► (release) ──► main
          └─ feat/hu-1-login ─ PR ───────┘
```

1. **Toma una tarea** del tablero del sprint y asígnatela. Toda rama debe estar ligada a una HU o issue.
2. **Actualiza `develop`** y crea tu rama desde ahí:
   ```bash
   git switch develop && git pull
   git switch -c feat/hu-1-login
   ```
3. **Trabaja en commits pequeños** siguiendo [Conventional Commits](docs/conventions/GIT.md#2-commits).
   No hay validaciones al hacer commit: commitea con libertad. La calidad se verifica en el PR.
4. **Antes de publicar**, verifica localmente (es lo mismo que ejecuta la CI):
   ```bash
   npm run lint
   npm run format:check
   npm run typecheck
   ```
5. **Sincroniza con `develop`** (rebase preferido) y sube tu rama:
   ```bash
   git fetch origin && git rebase origin/develop
   git push -u origin feat/hu-1-login
   ```
6. **Abre un Pull Request hacia `develop`** usando la plantilla. Incluye capturas o video para cambios de UI.
7. **Revisión**: mínimo **1 aprobación** de otro integrante y la CI (`.github/workflows/ci.yml`) en verde.
   Responde todos los comentarios.
8. **Merge**: *Squash and merge*, con título del PR en formato Conventional Commit. Borra la rama.

## 3. Definition of Done

Una HU / tarea está terminada cuando:

- [ ] Cumple **todos** los criterios de aceptación de la HU (incluidos los mensajes exactos).
- [ ] Respeta la visibilidad por rol definida en [ROLES-Y-PERMISOS](docs/architecture/ROLES-Y-PERMISOS.md).
- [ ] La CI pasa: `npm run lint`, `npm run format:check` y `npm run typecheck` sin errores ni advertencias.
- [ ] Probada en **Android** e **iOS** (o simulador/Expo Go) y, si aplica, en web.
- [ ] Funciona en tema claro y oscuro, y maneja estados de *carga*, *vacío* y *error*.
- [ ] Tiene pruebas para la lógica no trivial (validaciones, permisos, mapeos).
- [ ] Documentación actualizada si cambió una convención, una ruta o una dependencia.
- [ ] PR revisado y aprobado, mergeado en `develop`.

## 4. Agregar dependencias

- Usa siempre `npx expo install <paquete>` (nunca `npm install <paquete>` directo).
- Prefiere módulos oficiales de Expo antes que librerías de terceros.
- Toda dependencia nueva relevante (no utilitarias triviales) requiere un **ADR** en
  [`docs/decisions/`](docs/decisions/README.md) y mención en el PR.
- Si la librería tiene código nativo fuera de Expo Go, avísalo en el PR: el equipo necesitará un development build.

## 5. Reportar errores y proponer cambios

Usa las plantillas de *issue* en GitHub:

- **Historia de usuario / tarea** — para trabajo planificado.
- **Bug** — pasos para reproducir, resultado esperado vs obtenido, dispositivo y SO.

## 6. Código de conducta

Comentarios de revisión sobre el código, no sobre las personas. Explica el *porqué* de las
sugerencias y distingue entre bloqueantes y opcionales (prefijo `nit:` para lo opcional).
