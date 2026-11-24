// Mock de @maplibre/maplibre-react-native para Jest: los módulos nativos de MapLibre no existen en Node.
// Cada componente se dibuja como un View con sus props, para que las pruebas puedan simular `onPress`
// (`nativeEvent.lngLat`) / `onDragEnd` y buscar los elementos por `accessibilityLabel` o `testID`.
// `Camera` expone por ref los métodos imperativos como `jest.fn()`.
const React = require('react');
const { View } = require('react-native');

function createMock(name) {
  const Component = React.forwardRef(function MockMapLibreComponent(props, ref) {
    return React.createElement(View, { ...props, ref, testID: props.testID ?? name });
  });
  Component.displayName = name;
  return Component;
}

const Camera = React.forwardRef(function MockCamera(props, ref) {
  React.useImperativeHandle(ref, () => ({
    jumpTo: jest.fn(),
    easeTo: jest.fn(),
    flyTo: jest.fn(),
    fitBounds: jest.fn(),
    zoomTo: jest.fn(),
    setStop: jest.fn(() => Promise.resolve()),
  }));
  return React.createElement(View, { testID: props.testID ?? 'Camera' });
});
Camera.displayName = 'Camera';

module.exports = {
  __esModule: true,
  Map: createMock('Map'),
  Camera,
  GeoJSONSource: createMock('GeoJSONSource'),
  VectorSource: createMock('VectorSource'),
  RasterSource: createMock('RasterSource'),
  ImageSource: createMock('ImageSource'),
  Layer: createMock('Layer'),
  Marker: createMock('Marker'),
  ViewAnnotation: createMock('ViewAnnotation'),
  LayerAnnotation: createMock('LayerAnnotation'),
  Callout: createMock('Callout'),
  UserLocation: createMock('UserLocation'),
  NativeUserLocation: createMock('NativeUserLocation'),
  Images: createMock('Images'),
};
