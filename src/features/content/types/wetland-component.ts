/** Foto de un componente del humedal (HU-14 / HU-15). */
export type WetlandComponentPhoto = {
  id: string;
  url: string;
};

/**
 * Componente del humedal (aves, flora, insectos…). `type` es el identificador de la API
 * (`AVES`, `FLORA`…), que también va en la URL: `/api/componentes/{tipo}`.
 */
export type WetlandComponent = {
  type: string;
  name: string;
  description: string;
  /** `false` si aún no tiene información publicada (HU-14 CA2). */
  hasContent: boolean;
  photos: WetlandComponentPhoto[];
  /** Fecha ISO de la última actualización, o `null` si nunca se ha editado. */
  updatedAt: string | null;
};

/** Foto elegida en el teléfono que aún no se ha subido. */
export type NewComponentPhoto = {
  uri: string;
  mimeType: 'image/jpeg' | 'image/png';
  fileName: string | null;
};

/** Cambios que se aplican al presionar GUARDAR CAMBIOS (HU-15). */
export type WetlandComponentChanges = {
  name: string;
  description: string;
  removedPhotoIds: string[];
  newPhotos: NewComponentPhoto[];
};
