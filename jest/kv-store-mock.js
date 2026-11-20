// Doble en memoria de `expo-sqlite/kv-store` para las pruebas (el módulo nativo no existe en Jest).
const store = new Map();

const Storage = {
  getItemAsync: async (key) => (store.has(key) ? store.get(key) : null),
  setItemAsync: async (key, value) => {
    store.set(key, typeof value === 'function' ? value(store.get(key) ?? null) : value);
  },
  removeItemAsync: async (key) => store.delete(key),
  clearAsync: async () => {
    store.clear();
    return true;
  },
  getAllKeysAsync: async () => [...store.keys()],
  getItemSync: (key) => (store.has(key) ? store.get(key) : null),
  setItemSync: (key, value) => store.set(key, value),
  removeItemSync: (key) => store.delete(key),
  clearSync: () => {
    store.clear();
    return true;
  },
};
Storage.getItem = Storage.getItemAsync;
Storage.setItem = Storage.setItemAsync;
Storage.removeItem = Storage.removeItemAsync;

module.exports = Storage;
module.exports.default = Storage;
module.exports.__esModule = true;
