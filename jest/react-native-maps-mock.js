// Mock de react-native-maps para Jest: el módulo nativo (RNMapsAirModule) no existe en Node.
// Cada componente se dibuja como un View con sus props, para que las pruebas puedan simular
// `onPress` / `onDragEnd` y buscar los marcadores por `accessibilityLabel` o `testID`.
const React = require('react');
const { View } = require('react-native');

function createMock(name) {
  const Component = React.forwardRef(function MockMapComponent(props, ref) {
    return React.createElement(View, { ...props, ref, testID: props.testID ?? name });
  });
  Component.displayName = name;
  return Component;
}

const MapView = createMock('MapView');

module.exports = {
  __esModule: true,
  default: MapView,
  MapView,
  Marker: createMock('Marker'),
  Polyline: createMock('Polyline'),
  Polygon: createMock('Polygon'),
  Circle: createMock('Circle'),
  Callout: createMock('Callout'),
  PROVIDER_GOOGLE: 'google',
  PROVIDER_DEFAULT: undefined,
};
