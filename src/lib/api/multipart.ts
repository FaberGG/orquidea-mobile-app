import { File, UploadType } from 'expo-file-system';

import { getEnv } from '@/config';

import { ApiError, readServerMessage } from './api-error';
import { getAuthorizationHeader, handleUnauthorized } from './auth-interceptor';

/** Archivo local que se sube junto con campos de texto. */
export type MultipartFile = {
  /** URI local (`file://…`) devuelta por el selector de imágenes. */
  uri: string;
  mimeType: string;
};

/**
 * Envía `multipart/form-data` con un archivo local usando el módulo nativo de Expo.
 *
 * Se usa en lugar de `fetch` + `FormData` porque en Android (Expo Go) `fetch` no lee bien los archivos
 * de caché del selector: la foto llegaba vacía y la API la rechazaba como formato inválido.
 *
 * Mantiene las mismas reglas que `apiClient`: encabezado de autorización, `ApiError` con el mensaje del
 * servidor y cierre de sesión ante `401`.
 */
export async function uploadMultipart(
  method: 'POST' | 'PUT',
  path: string,
  fields: Record<string, string>,
  file: MultipartFile,
  fileField: string,
): Promise<unknown> {
  const url = `${getEnv().apiUrl}${path}`;
  const authorization = await getAuthorizationHeader();

  let result;
  try {
    result = await new File(file.uri).upload(url, {
      httpMethod: method,
      uploadType: UploadType.MULTIPART,
      fieldName: fileField,
      mimeType: file.mimeType,
      parameters: fields,
      headers: { Accept: 'application/json', ...authorization },
    });
  } catch (cause) {
    throw new ApiError({ status: 0, kind: 'network', path, cause });
  }

  const body = readJson(result.body);
  if (result.status < 200 || result.status >= 300) {
    if (result.status === 401) await handleUnauthorized();
    throw new ApiError({
      status: result.status,
      kind: 'http',
      path,
      serverMessage: readServerMessage(body),
      body,
    });
  }
  return body;
}

function readJson(text: string): unknown {
  if (text.length === 0) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
