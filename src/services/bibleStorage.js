const DB_NAME = 'CCFBCBibleDB';
const DB_VERSION = 1;
const STORE_NAME = 'versions';

/**
 * Open the IndexedDB database, creating it if it doesn't exist.
 * @returns {Promise<IDBDatabase>}
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported by this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Save a Bible version's data to offline storage.
 * @param {string} versionId - e.g., 'KJV'
 * @param {Object} data - The full JSON data for the Bible version
 * @returns {Promise<void>}
 */
export const saveVersionToOffline = async (versionId, data) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put({
        id: versionId,
        data: data,
        downloadedAt: new Date().toISOString()
      });

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error(`Failed to save version ${versionId} offline:`, error);
    throw error;
  }
};

/**
 * Get a downloaded Bible version from offline storage.
 * @param {string} versionId - e.g., 'KJV'
 * @returns {Promise<Object|null>}
 */
export const getOfflineVersion = async (versionId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(versionId);

      request.onsuccess = (event) => {
        resolve(event.target.result ? event.target.result.data : null);
      };
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error(`Failed to get offline version ${versionId}:`, error);
    return null; // Graceful fallback
  }
};

/**
 * Check if a version is currently downloaded.
 * @param {string} versionId - e.g., 'KJV'
 * @returns {Promise<boolean>}
 */
export const isVersionDownloaded = async (versionId) => {
  try {
    const data = await getOfflineVersion(versionId);
    return data !== null;
  } catch {
    return false;
  }
};

/**
 * Delete a downloaded version from offline storage.
 * @param {string} versionId - e.g., 'KJV'
 * @returns {Promise<void>}
 */
export const deleteDownloadedVersion = async (versionId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(versionId);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error(`Failed to delete offline version ${versionId}:`, error);
    throw error;
  }
};

/**
 * Get a list of all downloaded versions (just metadata, not full text).
 * @returns {Promise<Array<{id: string, downloadedAt: string}>>}
 */
export const listDownloadedVersions = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        const results = event.target.result || [];
        // Map to avoid sending the entire huge data objects in the list
        resolve(results.map(item => ({
          id: item.id,
          downloadedAt: item.downloadedAt
        })));
      };
      request.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    console.error('Failed to list downloaded versions:', error);
    return [];
  }
};
