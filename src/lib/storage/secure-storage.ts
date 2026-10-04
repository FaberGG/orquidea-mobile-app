import * as SecureStore from 'expo-secure-store';

/** Lee un valor del almacenamiento cifrado del sistema (Keychain/Keystore). */
export async function getSecureItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

/** Guarda un valor pequeño en el almacenamiento cifrado del sistema. */
export async function setSecureItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

/** Elimina un valor del almacenamiento cifrado del sistema. */
export async function deleteSecureItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
