import { bibleVersions } from '../data/bibleVersions';
import { bibleBooks } from '../data/bibleBooks';
import { 
  getOfflineVersion, 
  saveVersionToOffline, 
  deleteDownloadedVersion, 
  listDownloadedVersions,
  isVersionDownloaded
} from './bibleStorage';

const BASE_URL = import.meta.env.VITE_BIBLE_API_BASE_URL || 'https://bible-api.com';
const API_KEY = import.meta.env.VITE_BIBLE_API_KEY;
const OFFLINE_SCHEMA_VERSION = 1;

const OFFLINE_DOWNLOAD_SOURCES = {
  KJV: {
    url: 'https://raw.githubusercontent.com/bibleapi/bibleapi-bibles-json/master/kjv.json',
    format: 'bibleapi-resultset'
  },
  ASV: {
    url: 'https://raw.githubusercontent.com/bibleapi/bibleapi-bibles-json/master/asv.json',
    format: 'bibleapi-resultset'
  }
};

const BOOK_ALIASES = {
  Psalms: ['Psalm', 'Ps'],
  'Song of Solomon': ['Song of Songs', 'Song', 'Canticles'],
  Revelation: ['Revelations', 'Rev']
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getBookAliases = (bookName) => {
  const aliases = [bookName, ...(BOOK_ALIASES[bookName] || [])];
  return aliases.flatMap(alias => {
    if (/^\d\s/.test(alias)) {
      return [alias, alias.replace(/\s+/, '')];
    }
    return [alias];
  });
};

const parseReference = (reference) => {
  const cleanedReference = String(reference || '')
    .replace(/\(([^)]+)\)\s*$/g, '')
    .trim();
  const bookCandidates = bibleBooks
    .flatMap(bookItem => getBookAliases(bookItem.name).map(alias => ({
      alias,
      bookName: bookItem.name
    })))
    .sort((a, b) => b.alias.length - a.alias.length);

  for (const candidate of bookCandidates) {
    const aliasPattern = escapeRegExp(candidate.alias).replace(/\\ /g, '\\s*');
    const match = cleanedReference.match(
      new RegExp(`^${aliasPattern}\\s+(\\d+)(?::(\\d+)(?:-(\\d+))?)?`, 'i')
    );

    if (match) {
      return {
        bookName: candidate.bookName,
        book: candidate.bookName,
        chapter: Number(match[1]),
        verseStart: match[2] ? Number(match[2]) : null,
        verseEnd: match[3] ? Number(match[3]) : match[2] ? Number(match[2]) : null
      };
    }
  }

  return null;
};

export const parseScriptureReference = (reference) => {
  const parsed = parseReference(reference);
  if (!parsed) return null;

  const bookConfig = bibleBooks.find(item => item.name === parsed.bookName);
  if (!bookConfig || parsed.chapter < 1 || parsed.chapter > bookConfig.chapters) {
    return null;
  }

  return {
    book: parsed.bookName,
    chapter: parsed.chapter,
    startVerse: parsed.verseStart,
    endVerse: parsed.verseEnd,
    reference: parsed.verseStart
      ? `${parsed.bookName} ${parsed.chapter}:${parsed.verseStart}${parsed.verseEnd && parsed.verseEnd !== parsed.verseStart ? `-${parsed.verseEnd}` : ''}`
      : `${parsed.bookName} ${parsed.chapter}`
  };
};

export const isInternalBibleVersionSupported = (versionId) => {
  const version = bibleVersions.find(item => item.id === versionId);
  return Boolean(version && version.sourceType === 'open-api');
};

export const getInternalBibleUrl = (reference, versionId) => {
  const parsed = parseScriptureReference(reference);
  if (!parsed || !isInternalBibleVersionSupported(versionId)) return null;

  const params = new URLSearchParams({
    version: versionId,
    book: parsed.book,
    chapter: String(parsed.chapter)
  });

  if (parsed.startVerse) params.set('startVerse', String(parsed.startVerse));
  if (parsed.endVerse) params.set('endVerse', String(parsed.endVerse));

  return `/bible?${params.toString()}`;
};

const isStructuredBibleData = (data) => {
  return Boolean(
    data &&
    data.schemaVersion === OFFLINE_SCHEMA_VERSION &&
    data.version &&
    data.books &&
    typeof data.books === 'object' &&
    !data.mockText
  );
};

const getLocalPassage = (reference, versionId, localData) => {
  if (!isStructuredBibleData(localData)) {
    throw new Error(`${versionId} is not available offline yet. Please download it first.`);
  }

  const parsedReference = parseReference(reference);
  if (!parsedReference) {
    throw new Error(`Could not read "${reference}" from offline Bible data.`);
  }

  const chapterVerses = localData.books?.[parsedReference.bookName]?.[String(parsedReference.chapter)];
  if (!chapterVerses || chapterVerses.length === 0) {
    throw new Error(`${parsedReference.bookName} ${parsedReference.chapter} was not found in the downloaded ${versionId} Bible.`);
  }

  const selectedVerses = parsedReference.verseStart
    ? chapterVerses.filter(item => {
      const verseEnd = parsedReference.verseEnd || parsedReference.verseStart;
      return item.verse >= parsedReference.verseStart && item.verse <= verseEnd;
    })
    : chapterVerses;

  if (selectedVerses.length === 0) {
    throw new Error(`${reference} was not found in the downloaded ${versionId} Bible.`);
  }

  const normalizedReference = parsedReference.verseStart
    ? `${parsedReference.bookName} ${parsedReference.chapter}:${parsedReference.verseStart}${parsedReference.verseEnd && parsedReference.verseEnd !== parsedReference.verseStart ? `-${parsedReference.verseEnd}` : ''}`
    : `${parsedReference.bookName} ${parsedReference.chapter}`;

  return {
    reference: normalizedReference,
    text: selectedVerses.map(item => item.text).join(' '),
    version: versionId,
    isLocal: true,
    verses: selectedVerses.map(item => ({
      book_name: parsedReference.bookName,
      chapter: parsedReference.chapter,
      verse: item.verse,
      text: item.text
    }))
  };
};

const normalizeBibleApiResultset = (versionId, data, onProgress) => {
  const rows = data?.resultset?.row;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`The downloaded ${versionId} Bible data was not in the expected format.`);
  }

  const books = {};
  let verseCount = 0;

  rows.forEach((row, index) => {
    const field = row?.field;
    if (!Array.isArray(field) || field.length < 5) return;

    const [, bookNumber, chapterNumber, verseNumber, verseText] = field;
    const bookName = bibleBooks[Number(bookNumber) - 1]?.name;
    if (!bookName || !chapterNumber || !verseNumber || !verseText) return;

    const chapterKey = String(chapterNumber);
    if (!books[bookName]) books[bookName] = {};
    if (!books[bookName][chapterKey]) books[bookName][chapterKey] = [];

    books[bookName][chapterKey].push({
      verse: Number(verseNumber),
      text: String(verseText).trim()
    });
    verseCount += 1;

    if (onProgress && index % 1000 === 0) {
      onProgress({
        stage: 'Preparing Bible text...',
        percent: 85 + Math.min(14, Math.round((index / rows.length) * 14))
      });
    }
  });

  if (!books.Matthew?.['1']?.length) {
    throw new Error(`The downloaded ${versionId} Bible data did not include Matthew 1.`);
  }

  return {
    schemaVersion: OFFLINE_SCHEMA_VERSION,
    version: versionId,
    books,
    meta: {
      source: 'bibleapi/bibleapi-bibles-json',
      verseCount,
      bookCount: Object.keys(books).length,
      normalizedAt: new Date().toISOString()
    }
  };
};

const fetchJsonWithProgress = async (url, onProgress) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download Bible text: ${response.statusText}`);
  }

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (!response.body || !contentLength) {
    onProgress?.({ stage: 'Downloading Bible text...', percent: 45 });
    return response.json();
  }

  const reader = response.body.getReader();
  const chunks = [];
  let receivedLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    receivedLength += value.length;

    onProgress?.({
      stage: 'Downloading Bible text...',
      percent: Math.max(5, Math.min(84, Math.round((receivedLength / contentLength) * 84)))
    });
  }

  const chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (const chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  return JSON.parse(new TextDecoder('utf-8').decode(chunksAll));
};

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
    return getLocalPassage(reference, versionId, localData);
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
 * @param {(progress: {stage: string, percent?: number}) => void} onProgress
 */
export const downloadVersion = async (versionId, onProgress) => {
  const version = bibleVersions.find(v => v.id === versionId);
  
  if (!version || !version.canDownload) {
    throw new Error('This version cannot be downloaded for offline use.');
  }

  const downloadSource = OFFLINE_DOWNLOAD_SOURCES[versionId];
  if (!downloadSource) {
    throw new Error(`Offline download is not configured for ${versionId} yet.`);
  }

  if (!navigator.onLine) {
    throw new Error('You must be online to download a Bible version.');
  }

  try {
    onProgress?.({ stage: 'Starting download...', percent: 1 });
    const rawData = await fetchJsonWithProgress(downloadSource.url, onProgress);
    const fullData = normalizeBibleApiResultset(versionId, rawData, onProgress);

    onProgress?.({ stage: 'Saving for offline use...', percent: 99 });
    await saveVersionToOffline(versionId, {
      ...fullData,
      meta: {
        ...fullData.meta,
        sourceUrl: downloadSource.url
      }
    });
    onProgress?.({ stage: 'Downloaded', percent: 100 });
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
