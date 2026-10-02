# src/features/species/components/

**Responsabilidad:** pantallas y componentes visuales de las fichas taxonómicas.

| Componente | Descripción | HU |
|---|---|---|
| `SpeciesListScreen` | `CategorySelector` + lista de `SpeciesCard`; estado vacío con el mensaje de HU-10; botón crear con `<Can>` | HU-10 |
| `SpeciesDetailScreen` | Todos los campos de la ficha + `SpeciesActions` | HU-10 |
| `CreateSpeciesScreen` | `SpeciesForm` + **GUARDAR FICHA** | HU-7 |
| `EditSpeciesScreen` | `SpeciesForm` precargado + **GUARDAR CAMBIOS** / **CANCELAR** | HU-8 |
| `CategorySelector` | Aves / Plantas / Insectos | HU-10 |
| `SpeciesCard` | Foto y nombre común (`vernacularName`) | HU-10 |
| `SpeciesForm` | Formulario único de crear/editar, con selector de foto (jpg, png, máx. 10 MB; opcional al editar) | HU-7, HU-8 |
| `SpeciesActions` | Editar y Eliminar (con confirmación), envueltos en `<Can>`; Eliminar espera el endpoint (docs/api B1) | HU-8, HU-9 |
