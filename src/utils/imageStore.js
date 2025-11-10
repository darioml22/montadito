/*
Simple IndexedDB helper for storing image Blobs.
Provides: putImage(file) -> numeric key, getImage(key) -> Blob, getImageURL(key) -> object URL, deleteImage(key)
*/
export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("memories-images-db", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putImage(file) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", "readwrite");
    const store = tx.objectStore("images");
    const req = store.add(file);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getImage(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const req = store.get(Number(key));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const urlCache = new Map(); // key -> objectURL
export async function getImageURL(key) {
  if (key === null || key === undefined) return null;
  if (urlCache.has(key)) return urlCache.get(key);
  const blob = await getImage(key);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(key, url);
  return url;
}

export function revokeImageURL(key) {
  const url = urlCache.get(key);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(key);
  }
}

export async function deleteImage(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", "readwrite");
    const store = tx.objectStore("images");
    const req = store.delete(Number(key));
    req.onsuccess = () => {
      revokeImageURL(key);
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}