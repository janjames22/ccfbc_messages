import { bibleVersions } from '../data/bibleVersions';
import { 
  getOfflineVersion, 
  saveVersionToOffline, 
  deleteDownloadedVersion, 
  listDownloadedVersions,
  isVersionDownloaded
} from './bibleStorage';

const BASE_URL = import.meta.env.VITE_BIBLE_API_BASE_URL || 'https://bible-api.com';
const API_KEY = import.meta.env.VITE_BIBLE_API_KEY;
const PROVIDER = import.meta.env.VITE_BIBLE_API_PROVIDER; // e.g. 'bible-api'

/**
 * Get all available languages based on configured versions.
 * @returns {string[]}
 */
export const getAvailableLanguages = () => {
  const languages = new Set(bibleVersions.map(v => v.language));
  return Array.from(languages).sort();
};

/**
 * Get Bible versions for a specific language.
 * @param {string} language 
 * @returns {import('../types/bible').BibleVersion[]}
 */
export const getVersionsByLanguage = (language) => {
  return bibleVersions.filter(v => v.language === language);
};

/**
 * Check if the current version needs a licensed API to work online.
 */
export const requiresLicensedApi = (versionId) => {
  const version = bibleVersions.find(v => v.id === versionId);
  if (!version) return false;
  return version.copyrightStatus === 'licensed' && !API_KEY;
};

/**
 * Fetch a passage from the API or local DB.
 * @param {string} reference - e.g. "John 3:16"
 * @param {string} versionId - e.g. "KJV"
 * @returns {Promise<import('../types/bible').BiblePassage>}
 */
export const getPassage = async (reference, versionId) => {
  const isDownloaded = await isVersionDownloaded(versionId);
  
  if (isDownloaded) {
    const localData = await getOfflineVersion(versionId);
    // In a real scenario, we'd parse `localData` to extract the exact chapter/verse.
    // For this implementation, we return a simulated local response.
    return {
      reference,
      text: localData?.mockText || `[Offline Data for ${versionId} - ${reference}]`,
      version: versionId,
      isLocal: true,
      verses: []
    };
  }

  // If no internet, and not downloaded, throw an error
  if (!navigator.onLine) {
    throw new Error('You are offline and this version is not downloaded.');
  }

  if (requiresLicensedApi(versionId)) {
    throw new Error('This Bible version requires licensed access. You can open it externally for now.');
  }

  // Attempt to fetch from the provider
  try {
    // Adapter for bible-api.com (open API for KJV/BBE, etc)
    const url = `${BASE_URL}/${encodeURIComponent(reference)}?translation=${versionId.toLowerCase()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from API: ${response.statusText}`);
    }
    const data = await response.json();
    
    return {
      reference: data.reference || reference,
      text: data.text,
      verses: data.verses || [],
      version: versionId,
      isLocal: false
    };
  } catch (error) {
    console.error('Error fetching passage:', error);
    throw error;
  }
};

/**
 * Get an external fallback URL for the passage.
 * @param {string} reference 
 * @param {string} versionId 
 */
export const getExternalBibleUrl = (reference, versionId) => {
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=${versionId}`;
};

/**
 * Search the Bible. (Basic implementation for open APIs)
 */
export const searchBible = async (query, versionId) => {
  if (requiresLicensedApi(versionId)) {
    throw new Error('Search requires licensed access for this version.');
  }
  // Simplified mock search for now as bible-api.com doesn't have a robust cross-version search natively documented in this way
  throw new Error('In-app search is not yet fully implemented for this provider.');
};

/**
 * Download a full version for offline use.
 * @param {string} versionId 
 */
export const downloadVersion = async (versionId) => {
  const version = bibleVersions.find(v => v.id === versionId);
  
  if (!version || !version.canDownload) {
    throw new Error('This version cannot be downloaded for offline use.');
  }

  if (!navigator.onLine) {
    throw new Error('You must be online to download a Bible version.');
  }

  try {
    // In a real application, you would download a large JSON structure containing the full text.
    // E.g., const res = await fetch(`${BASE_URL}/downloads/${versionId}.json`);
    // const fullData = await res.json();
    
    // Simulating a download delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockFullData = {
      version: versionId,
      mockText: `This is the offline downloaded text for the entire ${versionId} Bible. Local parsing is enabled.`
    };

    await saveVersionToOffline(versionId, mockFullData);
  } catch (error) {
    console.error('Error downloading version:', error);
    throw error;
  }
};

export {
  deleteDownloadedVersion,
  listDownloadedVersions,
  isVersionDownloaded
};
