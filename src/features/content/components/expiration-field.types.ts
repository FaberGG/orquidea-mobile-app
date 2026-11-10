export type ExpirationFieldProps = {
  value: Date | null;
  onChange: (value: Date | null) => void;
  hasError?: boolean;
  /** `false` al editar un anuncio que ya tiene fecha: la API no permite quitarla (SCRUM-71). */
  canClear?: boolean;
  /** Texto de ayuda; por defecto, el de publicar (HU-23). */
  hint?: string;
};
