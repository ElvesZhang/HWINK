// Page Debug IDs - for easy reference during development
export const PAGE_IDS = {
  'home': 1,
  'settings': 2,
  'security': 3,
  'connectivity': 4,
  'general': 5,
  'about': 6,
  'change-pin': 7,
  'passphrase': 8,
  'verify-recovery': 9,
  'fingerprint': 10,
  'language': 11,
  'lock-screen': 12,
  'auto-lock': 13,
  'storage': 14,
  'bluetooth': 15,
  'nfc': 16,
  'firmware-info': 17,
  'firmware-update': 18,
  'download-app': 19,
  'reset-device': 20,
  'history': 21,
  'sign-request': 22,
  'passkey': 23,
} as const;

// Sub-page IDs - for pages with multiple states/steps
export const SUB_PAGE_IDS = {
  // #7 - Change PIN Page
  'change-pin': {
    'current': 1,      // 7-1: Enter current PIN
    'new': 2,          // 7-2: Enter new PIN
    'confirm': 3,      // 7-3: Confirm new PIN
    'success': 4,      // 7-4: Success message
  },
  
  // #8 - Passphrase Page
  'passphrase': {
    'main': 1,         // 8-1: Main passphrase menu
    'enable': 2,       // 8-2: Enable passphrase
    'verify-pin': 3,   // 8-3: Verify PIN before setting
    'set': 4,          // 8-4: Set passphrase
    'confirm': 5,      // 8-5: Confirm passphrase
    'success': 6,      // 8-6: Success message
  },
  
  // #9 - Verify Recovery Page
  'verify-recovery': {
    'menu': 1,         // 9-1: Choose verification method
    'verify-pin': 2,   // 9-2: Verify PIN first
    'full': 3,         // 9-3: Full phrase verification
    'random': 4,       // 9-4: Random word verification
    'success': 5,      // 9-5: Verification success
  },
  
  // #10 - Fingerprint Page
  'fingerprint': {
    'list': 1,         // 10-1: Fingerprint list
    'add-pin': 2,      // 10-2: Verify PIN before adding
    'scanning': 3,     // 10-3: Scanning fingerprint
    'success': 4,      // 10-4: Fingerprint added
  },
  
  // #15 - Bluetooth Page
  'bluetooth': {
    'main': 1,         // 15-1: Main bluetooth toggle
    'pairing': 2,      // 15-2: Pairing in progress
    'paired': 3,       // 15-3: Successfully paired
  },
  
  // #16 - NFC Page
  'nfc': {
    'main': 1,         // 16-1: Main NFC menu
    'warning': 2,      // 16-2: Security warning before backup
    'scanning': 3,     // 16-3: Scanning NFC card
    'writing': 4,      // 16-4: Writing to card
    'success': 5,      // 16-5: Backup success
    'error': 6,        // 16-6: Backup error
  },
  
  // #18 - Firmware Update Page
  'firmware-update': {
    'check': 1,        // 18-1: Checking for updates
    'available': 2,    // 18-2: Update available
    'downloading': 3,  // 18-3: Downloading update
    'installing': 4,   // 18-4: Installing update
    'success': 5,      // 18-5: Update complete
    'latest': 6,       // 18-6: Already latest version
  },
  
  // #20 - Reset Device Page
  'reset-device': {
    'main': 1,         // 20-1: Main reset options
    'warning': 2,      // 20-2: Warning before reset
    'verify-pin': 3,   // 20-3: Verify PIN
    'resetting': 4,    // 20-4: Reset in progress
    'complete': 5,     // 20-5: Reset complete
  },
  
  // #21 - Sign History Page
  'history': {
    'list': 1,         // 21-1: History list
    'detail': 2,       // 21-2: Transaction detail
  },
  
  // #23 - Passkey (FIDO2 authenticator)
  'passkey': {
    'list': 1,         // 23-1: Authenticator status + registered passkeys
    'detail': 2,       // 23-2: Credential detail
    'delete': 3,       // 23-3: Delete confirmation
    'register': 4,     // 23-4: Incoming registration request
    'auth': 5,         // 23-5: Incoming sign-in request
    'success': 6,      // 23-6: Result screen
  },

  // #22 - Sign Request Page
  'sign-request': {
    'transfer': 1,         // 22-1: Transfer request (verify code is the shared first screen for all types)
    'message': 3,          // 22-3: Message signing
    'blind': 5,            // 22-5: Blind signing
    'contractCall': 7,     // 22-7: Contract call (Swap)
    'approve': 8,          // 22-8: Token approval (unlimited)
    'approveLimit': 9,     // 22-9: Token approval (limited)
  },
} as const;

export type PageKey = keyof typeof PAGE_IDS;
export type SubPageKey<T extends PageKey> = T extends keyof typeof SUB_PAGE_IDS 
  ? keyof typeof SUB_PAGE_IDS[T] 
  : never;

export function getPageId(page: PageKey): number {
  return PAGE_IDS[page];
}

export function getSubPageId<T extends PageKey>(
  page: T, 
  subPage?: SubPageKey<T>
): string {
  const mainId = PAGE_IDS[page];
  if (!subPage || !(page in SUB_PAGE_IDS)) {
    return `${mainId}`;
  }
  const subId = SUB_PAGE_IDS[page as keyof typeof SUB_PAGE_IDS][subPage as string];
  return `${mainId}-${subId}`;
}

export function getPageById(id: number): PageKey | undefined {
  const entry = Object.entries(PAGE_IDS).find(([, pageId]) => pageId === id);
  return entry ? entry[0] as PageKey : undefined;
}