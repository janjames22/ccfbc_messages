import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ccfbc_downloaded_messages';

export const useOfflineMessages = () => {
  const [downloadedIds, setDownloadedIds] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(downloadedIds));
  }, [downloadedIds]);

  const isDownloaded = (id) => downloadedIds.includes(id);

  const toggleDownload = (id) => {
    if (isDownloaded(id)) {
      if (window.confirm('Remove this message from offline reading?')) {
        setDownloadedIds(prev => prev.filter(item => item !== id));
        return 'removed';
      }
      return 'cancelled';
    } else {
      setDownloadedIds(prev => [...prev, id]);
      return 'saved';
    }
  };

  const removeDownload = (id) => {
    setDownloadedIds(prev => prev.filter(item => item !== id));
  };

  return {
    downloadedIds,
    isDownloaded,
    toggleDownload,
    removeDownload
  };
};
