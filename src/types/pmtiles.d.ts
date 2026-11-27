// SCRUM-85: Metro empaqueta los `.pmtiles` como assets (ver `metro.config.js`); al importarlos se obtiene su
// id de asset, que se resuelve con `expo-asset`.
declare module '*.pmtiles' {
  const assetId: number;
  export default assetId;
}
