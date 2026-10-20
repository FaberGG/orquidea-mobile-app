const SPECIES_QR_PATTERN =
  /^orquideamobileapp:\/\/species\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/** Acepta únicamente el enlace QR de la app y devuelve el UUID normalizado. */
export function parseSpeciesQr(value: string): string | null {
  if (value.length > 256 || /[\u0000-\u001f\u007f]/.test(value)) return null;
  const match = SPECIES_QR_PATTERN.exec(value.trim());
  if (!match || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(match[1])) return null;
  return match[1].toLowerCase();
}
