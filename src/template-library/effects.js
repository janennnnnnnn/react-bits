async function transact(mode, action) {
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open('visual-jade-effects', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('effects', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('effects', mode);
      const request = action(transaction.objectStore('effects'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export const readEffects = () => transact('readonly', store => store.getAll());
export const saveEffect = effect => transact('readwrite', store => store.put(effect));
export const deleteEffect = id => transact('readwrite', store => store.delete(id));
