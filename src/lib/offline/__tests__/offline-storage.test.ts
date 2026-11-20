import {
  getOfflineJson,
  keyValueStorage,
  removeOfflineItem,
  setOfflineJson,
} from '../offline-storage';

describe('offlineStorage (kv-store)', () => {
  it('guarda, lee y borra valores JSON', async () => {
    await setOfflineJson('cola', [{ id: 'a' }]);
    expect(await getOfflineJson('cola')).toEqual([{ id: 'a' }]);

    await removeOfflineItem('cola');
    expect(await getOfflineJson('cola')).toBeNull();
  });

  it('devuelve null si el valor guardado está corrupto', async () => {
    await keyValueStorage.setItem('roto', '{no es json');
    expect(await getOfflineJson('roto')).toBeNull();
  });
});
