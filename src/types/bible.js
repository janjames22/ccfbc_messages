/**
 * @typedef {Object} BibleVersion
 * @property {string} id - The version identifier (e.g., 'KJV', 'ESV', 'MBBTAG')
 * @property {string} name - The full name of the version
 * @property {string} language - The language of the version
 * @property {boolean} offlineAllowed - Whether this version can be stored offline
 * @property {string} sourceType - The source API or fallback strategy
 * @property {boolean} canDownload - Whether download is enabled in the UI
 */

/**
 * @typedef {Object} BibleVerse
 * @property {string} book_name - The name of the book
 * @property {number} chapter - The chapter number
 * @property {number} verse - The verse number
 * @property {string} text - The verse text
 */

/**
 * @typedef {Object} BiblePassage
 * @property {string} reference - The requested reference string
 * @property {BibleVerse[]} verses - Array of verses in the passage
 * @property {string} text - Full text of the passage
 * @property {string} version - The version identifier used
 * @property {boolean} [isLocal] - Whether the passage was retrieved from local offline storage
 */

export {};
