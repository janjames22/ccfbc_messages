import { useState, useEffect } from 'react';

const IDS_KEY = 'ccfbc_downloaded_ids';
const CONTENT_KEY_PREFIX = 'ccfbc_msg_';

export const useOfflineMessages = () => {
  const [downloadedIds, setDownloadedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(IDS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing downloaded IDs:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(IDS_KEY, JSON.stringify(downloadedIds));
    } catch (e) {
      console.error('Error saving downloaded IDs:', e);
    }
  }, [downloadedIds]);

  const isDownloaded = (id) => downloadedIds.includes(id);

  const saveMessageOffline = (message) => {
    if (!message || !message.id) return false;

    try {
      // Validate and sanitize message object
      const sanitizedMessage = {
        id: message.id,
        title: message.title || 'Untitled Message',
        speaker: message.speaker || 'Unknown Speaker',
        service_date: message.service_date || new Date().toISOString(),
        main_verse_reference: message.main_verse_reference || '',
        main_verse_text: message.main_verse_text || '',
        summary: message.summary || '',
        key_points: Array.isArray(message.key_points) ? message.key_points : [],
        full_notes: message.full_notes || '',
        reflection_questions: Array.isArray(message.reflection_questions) ? message.reflection_questions : [],
        related_verses: Array.isArray(message.related_verses) ? message.related_verses : [],
        category: message.category || 'General',
        bible_version: message.bible_version || 'ESV',
      };

      localStorage.setItem(`${CONTENT_KEY_PREFIX}${message.id}`, JSON.stringify(sanitizedMessage));
      
      if (!downloadedIds.includes(message.id)) {
        setDownloadedIds(prev => [...prev, message.id]);
      }
      return true;
    } catch (e) {
      console.error('Error saving message offline:', e);
      return false;
    }
  };

  const removeMessageOffline = (id) => {
    try {
      localStorage.removeItem(`${CONTENT_KEY_PREFIX}${id}`);
      setDownloadedIds(prev => prev.filter(itemId => itemId !== id));
      return true;
    } catch (e) {
      console.error('Error removing offline message:', e);
      return false;
    }
  };

  const getOfflineMessage = (id) => {
    try {
      const saved = localStorage.getItem(`${CONTENT_KEY_PREFIX}${id}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error getting offline message:', e);
      // If corrupted, remove it
      removeMessageOffline(id);
      return null;
    }
  };

  return {
    downloadedIds,
    isDownloaded,
    saveMessageOffline,
    removeMessageOffline,
    getOfflineMessage
  };
};
