export const bibleVersions = [
  // English Versions
  {
    id: 'KJV',
    name: 'King James Version',
    abbreviation: 'KJV',
    language: 'English',
    languageCode: 'en',
    copyrightStatus: 'public-domain',
    offlineAllowed: true,
    canDownload: true,
    sourceType: 'open-api',
    externalFallbackProvider: 'Bible Gateway',
    notes: 'Public domain in most of the world.'
  },
  {
    id: 'WEB',
    name: 'World English Bible',
    abbreviation: 'WEB',
    language: 'English',
    languageCode: 'en',
    copyrightStatus: 'public-domain',
    offlineAllowed: false,
    canDownload: false,
    sourceType: 'open-api',
    externalFallbackProvider: 'Bible Gateway',
    notes: 'Modern English translation in the public domain. Offline package not bundled yet.'
  },
  {
    id: 'ASV',
    name: 'American Standard Version',
    abbreviation: 'ASV',
    language: 'English',
    languageCode: 'en',
    copyrightStatus: 'public-domain',
    offlineAllowed: true,
    canDownload: true,
    sourceType: 'open-api',
    externalFallbackProvider: 'Bible Gateway',
    notes: 'Public domain.'
  },
  {
    id: 'ESV',
    name: 'English Standard Version',
    abbreviation: 'ESV',
    language: 'English',
    languageCode: 'en',
    copyrightStatus: 'licensed',
    offlineAllowed: false,
    canDownload: false,
    sourceType: 'licensed-api',
    externalFallbackProvider: 'Bible Gateway',
    notes: 'Requires licensed API access or external fallback.'
  },
  {
    id: 'NIV',
    name: 'New International Version',
    abbreviation: 'NIV',
    language: 'English',
    languageCode: 'en',
    copyrightStatus: 'licensed',
    offlineAllowed: false,
    canDownload: false,
    sourceType: 'licensed-api',
    externalFallbackProvider: 'Bible Gateway',
    notes: 'Requires licensed API access or external fallback.'
  },
  {
    id: 'NKJV',
    name: 'New King James Version',
    abbreviation: 'NKJV',
    language: 'English',
    languageCode: 'en',
    copyrightStatus: 'licensed',
    offlineAllowed: false,
    canDownload: false,
    sourceType: 'licensed-api',
    externalFallbackProvider: 'Bible Gateway',
    notes: 'Requires licensed API access or external fallback.'
  },

  // Tagalog / Filipino Versions
  {
    id: 'MBBTAG',
    name: 'Magandang Balita Biblia',
    abbreviation: 'MBBTAG',
    language: 'Tagalog',
    languageCode: 'tl',
    copyrightStatus: 'licensed',
    offlineAllowed: false,
    canDownload: false,
    sourceType: 'licensed-api',
    externalFallbackProvider: 'Bible Gateway',
    notes: 'Philippine Bible Society copyright.'
  },
  {
    id: 'ABTAG',
    name: 'Ang Biblia',
    abbreviation: 'ABTAG',
    language: 'Tagalog',
    languageCode: 'tl',
    copyrightStatus: 'licensed', // Treated as licensed to be safe
    offlineAllowed: false,
    canDownload: false,
    sourceType: 'licensed-api',
    externalFallbackProvider: 'Bible Gateway',
    notes: 'Check specific copyright before storing.'
  },
  {
    id: 'TLAB',
    name: 'Tagalog Ang Biblia',
    abbreviation: 'TLAB',
    language: 'Tagalog',
    languageCode: 'tl',
    copyrightStatus: 'licensed', // Treated as licensed to be safe
    offlineAllowed: false,
    canDownload: false,
    sourceType: 'licensed-api',
    externalFallbackProvider: 'Bible Gateway',
    notes: 'Older translation, legal status verified before local storage.'
  }
];
