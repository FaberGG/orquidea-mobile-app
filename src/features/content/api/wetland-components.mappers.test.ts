import { toUpdateWetlandComponentDto, toWetlandComponent } from './wetland-components.mappers';

describe('toWetlandComponent', () => {
  it('traduce el JSON de la API', () => {
    expect(
      toWetlandComponent({
        tipo: 'AVES',
        nombre: 'Aves',
        descripcion: 'El humedal alberga especies residentes y migratorias...',
        tieneContenido: true,
        fotos: [{ id: '9d4e', url: 'http://localhost:9000/orquidea/componentes/4a1f.jpg' }],
        fechaActualizacion: '2026-10-09T15:30:00.123456Z',
      }),
    ).toEqual({
      type: 'AVES',
      name: 'Aves',
      description: 'El humedal alberga especies residentes y migratorias...',
      hasContent: true,
      photos: [{ id: '9d4e', url: 'http://localhost:9000/orquidea/componentes/4a1f.jpg' }],
      updatedAt: '2026-10-09T15:30:00.123456Z',
    });
  });

  it('acepta un componente sin contenido, sin fotos y sin fecha', () => {
    expect(
      toWetlandComponent({
        tipo: 'FLORA',
        nombre: 'Flora',
        descripcion: null,
        tieneContenido: false,
        fotos: null,
        fechaActualizacion: null,
      }),
    ).toEqual({
      type: 'FLORA',
      name: 'Flora',
      description: '',
      hasContent: false,
      photos: [],
      updatedAt: null,
    });
  });
});

describe('toUpdateWetlandComponentDto', () => {
  it('envía nombre y descripción sin espacios sobrantes', () => {
    expect(toUpdateWetlandComponentDto({ name: ' Aves ', description: ' Texto ' })).toEqual({
      nombre: 'Aves',
      descripcion: 'Texto',
    });
  });
});
