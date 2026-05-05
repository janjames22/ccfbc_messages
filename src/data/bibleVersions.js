export const bibleVersions = [
  {
    id: 'KJV',
    name: 'King James Version',
    language: 'English',
    offlineAllowed: true,
    sourceType: 'local-or-open-api',
    canDownload: true
  },
  {
    id: 'ESV',
    name: 'English Standard Version',
    language: 'English',
    offlineAllowed: false, // Default: no offline download without license
    sourceType: 'licensed-api-or-external',
    canDownload: false // Needs explicit VITE_BIBLE_API_KEY support
  },
  {
    id: 'MBBTAG',
    name: 'Magandang Balita Biblia',
    language: 'Tagalog',
    offlineAllowed: false, // Default: no offline download without PBS license
    sourceType: 'licensed-api-or-external',
    canDownload: false
  }
];
