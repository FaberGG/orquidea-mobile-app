# Utilidades de fichas taxonómicas

Funciones puras sin dependencias de cámara, navegación ni red. `parse-species-qr.ts` valida el payload
canónico de HU11 y devuelve el UUID normalizado; sus casos de prueba se leen de
[`docs/hu11/qr-contract.json`](../../../../docs/hu11/qr-contract.json), compartido con backend.

`species-catalog.ts` mantiene la copia local de fichas (HU-21): `applySpeciesSync` aplica una sincronización
completa o por cambios, `sortSpecies` ordena como la API, `filterSpeciesByCategory` filtra los chips y
`speciesOfflinePhotoUrls` / `speciesPhotoUrls` listan las fotos que se descargan. `getSpeciesOfflineState` dice
si una ficha está descargada (texto **y** todas sus fotos; sin fotos cuenta como completa) y
`summarizeSpeciesOffline` cuenta las completas.
