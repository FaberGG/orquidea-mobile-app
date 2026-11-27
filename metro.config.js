// Configuración de Metro: la de Expo más la extensión del mapa offline.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SCRUM-85: el mapa base offline de Popayán (`assets/maps/popayan-z14.pmtiles`) viaja dentro de la app
// como asset. Metro solo empaqueta las extensiones que conoce.
config.resolver.assetExts.push('pmtiles');

module.exports = config;
