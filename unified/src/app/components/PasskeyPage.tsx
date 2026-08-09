import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check, X, Trash2, KeyRound } from 'lucide-react';
import { PageDebugId } from './PageDebugId';
import { FingerprintVerifyPage } from './FingerprintVerifyPage';

// ════════════════════════════════════════════════════════════════════════
//  Passkey — the device as an external FIDO2 authenticator.
//
//  Views:
//   list      — authenticator status + registered passkeys (menu cards) +
//               demo triggers for the two incoming request types
//   detail    — one credential as a flat field list + Delete action
//   delete    — destructive confirmation (Bluetooth-remove pattern)
//   register  — incoming "create passkey" request (sign-screen action bar)
//   auth      — incoming "sign-in" request (sign-screen action bar)
//   verify    — FIDO2 user verification (reuses FingerprintVerifyPage)
//   success   — result screen, Done returns to the list
//
//  Real hardware receives register/auth requests over BLE/NFC/USB; the demo
//  buttons on the list stand in for that transport.
// ════════════════════════════════════════════════════════════════════════

// Fields follow the standards inventory in PASSKEY_DEVICE_DATA.md: everything
// shown is data a FIDO2 authenticator actually stores for a discoverable
// credential. Deliberately absent: created/last-used timestamps (no RTC, no
// protocol field) and a sign counter (not in the credMgmt surface; storage
// granularity is implementation-defined and may be always-zero).
interface Passkey {
  id: string;
  rpName: string;      // rp.name — human name of the relying party (optional in spec)
  rpId: string;        // rp.id — domain, the credential's true home
  user: string;        // user.name — account identifier
  displayName: string; // user.displayName — human name for the account
  algorithm: string;   // COSE key algorithm of the credential key pair
  uvRequired: boolean; // credProtect level 3 (always require user verification)?
  credId: string;      // credential id (shortened, grouped hex)
}

// Device capacity — getCredsMetadata / remainingDiscoverableCredentials are
// first-class in CTAP2.1, so the UI surfaces "used of max" directly.
const MAX_PASSKEYS = 25;

// 10 entries on purpose — enough to exercise the list pagination (4 per page
// → 3 pages). Includes two accounts on the same RP (github.com) since that is
// the case grouping/sorting has to keep legible.
const INITIAL_PASSKEYS: Passkey[] = [
  {
    id: '1', rpName: 'GitHub', rpId: 'github.com', user: 'elves-dev',
    displayName: 'Elves Zhang', algorithm: 'ES256', uvRequired: true,
    credId: '9F2C71A80B4ED31055C68A924D7FE021',
  },
  {
    id: '2', rpName: 'Google', rpId: 'google.com', user: 'elves@gmail.com',
    displayName: 'Elves Zhang', algorithm: 'Ed25519', uvRequired: true,
    credId: '2B8D4C019AE7663F1D5BC47088E20A9C',
  },
  {
    id: '3', rpName: 'Binance', rpId: 'binance.com', user: 'elves_hw',
    displayName: 'Elves', algorithm: 'ES256', uvRequired: false,
    credId: 'E4107BC923D6F58A0C1E92B76A44D803',
  },
  {
    id: '4', rpName: 'GitHub', rpId: 'github.com', user: 'elves-work',
    displayName: 'Elves Zhang', algorithm: 'ES256', uvRequired: true,
    credId: '5D0A98C2E17F44B6A3C58D10F92E67B4',
  },
  {
    id: '5', rpName: 'Apple', rpId: 'apple.com', user: 'elves@icloud.com',
    displayName: 'Elves Zhang', algorithm: 'ES256', uvRequired: true,
    credId: '81C4F0A2D95E36B7C10D84F26A93E5D0',
  },
  {
    id: '6', rpName: 'Microsoft', rpId: 'microsoft.com', user: 'elves@outlook.com',
    displayName: 'Elves Zhang', algorithm: 'ES256', uvRequired: true,
    credId: '3E92B7D014C6F85A2B7E10C94D58A36F',
  },
  {
    id: '7', rpName: 'Coinbase', rpId: 'coinbase.com', user: 'elves_cb',
    displayName: 'Elves', algorithm: 'Ed25519', uvRequired: true,
    credId: 'A70D3F92E14B86C5D20A97E31F64B8C2',
  },
  {
    id: '8', rpName: 'Kraken', rpId: 'kraken.com', user: 'elves_kr',
    displayName: 'Elves', algorithm: 'ES256', uvRequired: false,
    credId: '6B18E4D0A92C57F3B84D20E16C95A7F4',
  },
  {
    id: '9', rpName: 'Cloudflare', rpId: 'cloudflare.com', user: 'elves@hwink.dev',
    displayName: 'Elves Zhang', algorithm: 'ES256', uvRequired: true,
    credId: 'C25A80F14E96D3B7A08C52F49E17D6B3',
  },
  {
    id: '10', rpName: 'Proton', rpId: 'proton.me', user: 'elves@proton.me',
    displayName: 'Elves', algorithm: 'Ed25519', uvRequired: true,
    credId: 'F49C16E8B03D72A5C96E48B20D51A7E9',
  },
];

// Whole-card pagination, 4 cards per page — same pattern as Sign History.
const KEYS_PER_PAGE = 4;

// Incoming registration request (what the host would send over BLE/NFC/USB).
const REGISTER_REQUEST = { rpName: 'WebAuthn Demo', rpId: 'demo.webauthn.io', user: 'elves', displayName: 'Elves' };

type View = 'list' | 'detail' | 'delete' | 'register' | 'auth' | 'verify' | 'success';

const LABEL = 'text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5';

interface PasskeyPageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

export function PasskeyPage({ onBack, showDebugId }: PasskeyPageProps) {
  const [passkeys, setPasskeys] = useState<Passkey[]>(INITIAL_PASSKEYS);
  const [view, setView] = useState<View>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Which request the verify step belongs to. */
  const [pending, setPending] = useState<'register' | 'auth' | null>(null);
  /** List pagination (whole cards, Sign History pattern). */
  const [listPage, setListPage] = useState(0);
  /** Which credential an auth request uses (first one in the demo). */
  const authKey = passkeys[0];
  const selected = passkeys.find(p => p.id === selectedId) || null;

  // Display order: alphabetical by rp.id, then account name. The device has no
  // timestamps (PASSKEY_DEVICE_DATA.md § 5) and CTAP leaves enumeration order
  // undefined, so alphabetical is the only stable, explainable order it can
  // offer.
  const sortedKeys = [...passkeys].sort(
    (a, b) => a.rpId.localeCompare(b.rpId) || a.user.localeCompare(b.user),
  );
  const totalListPages = Math.ceil(sortedKeys.length / KEYS_PER_PAGE);
  const pagedKeys = sortedKeys.slice(listPage * KEYS_PER_PAGE, (listPage + 1) * KEYS_PER_PAGE);

  const header = (title: string, back?: () => void, right?: ReactNode) => (
    <div className="h-[45px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
      {back ? (
        <button onClick={back} className="flex items-center gap-2 active:scale-95 transition-transform">
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
        </button>
      ) : (
        <span className="text-lg font-bold text-black uppercase tracking-wide">{title}</span>
      )}
      {right}
    </div>
  );

  // ── VERIFY — FIDO2 user verification (fingerprint) ──
  if (view === 'verify') {
    return (
      <FingerprintVerifyPage
        title="Verify Identity"
        onBack={() => setView(pending === 'auth' ? 'auth' : 'register')}
        onVerifySuccess={() => {
          if (pending === 'register') {
            setPasskeys(prev => [
              {
                id: `pk-${prev.length + 1}`,
                rpName: REGISTER_REQUEST.rpName,
                rpId: REGISTER_REQUEST.rpId,
                user: REGISTER_REQUEST.user,
                displayName: REGISTER_REQUEST.displayName,
                algorithm: 'ES256',
                uvRequired: true,
                credId: '7A55D2C480FE19B36C0D81E54F2A9B67',
              },
              ...prev,
            ]);
            // Land back on the first page so the reviewer starts from a known
            // spot (the new key sorts into alphabetical position).
            setListPage(0);
          }
          // Sign-in leaves the stored credential unchanged — the device keeps
          // no per-use state (no timestamps, no exposed counter).
          setView('success');
        }}
        showDebugId={showDebugId}
      />
    );
  }

  // ── SUCCESS ──
  if (view === 'success') {
    const registered = pending === 'register';
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="passkey" subPage="success" showDebugId={showDebugId} />
        {header('Passkey')}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-4">
            <Check className="w-11 h-11 text-[#838383]" strokeWidth={3} />
          </div>
          <div className="text-2xl font-bold text-black mb-2">
            {registered ? 'Passkey Created' : 'Signed In'}
          </div>
          <div className="text-lg text-black leading-snug">
            {registered
              ? `A passkey for ${REGISTER_REQUEST.rpName} was stored on this device.`
              : `Sign-in to ${authKey.rpName} was approved.`}
          </div>
        </div>
        <div className="mx-4 mt-3 mb-4 pt-3 border-t-2 border-black flex-shrink-0">
          <button
            onClick={() => { setPending(null); setView('list'); }}
            className="w-full h-[60px] bg-black text-[#838383] rounded-sm hover:bg-[#222] active:scale-[0.97] transition-all font-bold text-lg uppercase tracking-wide"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── INCOMING REQUEST: REGISTER ──
  if (view === 'register') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="passkey" subPage="register" showDebugId={showDebugId} />
        {header('Passkey Request')}
        <div className="flex-1 px-5 pt-4 flex flex-col min-h-0">
          <div className="mb-4">
            <div className={LABEL}>New Passkey</div>
            <div className="text-3xl font-bold text-black tracking-tight leading-tight break-all">{REGISTER_REQUEST.rpName}</div>
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 mb-3.5" />

          <div>
            <div className={LABEL}>Service</div>
            <div className="text-xl font-normal text-black font-mono break-all leading-snug">{REGISTER_REQUEST.rpId}</div>
          </div>
          <div className="mt-2.5">
            <div className={LABEL}>Username</div>
            <div className="text-xl font-normal text-black break-all leading-snug">{REGISTER_REQUEST.user}</div>
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

          <p className="text-lg text-black leading-snug">
            The site is asking to create a passkey on this device. Approving requires identity verification.
          </p>
        </div>

        {/* Sign-screen action bar: reject square + primary confirm. */}
        <div className="mx-4 mt-3 mb-4 pt-3 border-t-2 border-black flex gap-2 flex-shrink-0">
          <button
            onClick={() => { setPending(null); setView('list'); }}
            className="w-[80px] h-[60px] border-2 border-black rounded-sm hover:bg-black group active:scale-[0.97] transition-all flex items-center justify-center flex-shrink-0"
            aria-label="Reject"
          >
            <X className="w-6 h-6 text-black group-hover:text-[#838383]" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => { setPending('register'); setView('verify'); }}
            className="flex-1 h-[60px] bg-black rounded-sm hover:bg-[#222] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-6 h-6 text-[#838383]" strokeWidth={2.5} />
            <span className="text-lg font-bold text-[#838383] uppercase tracking-wide">Create Passkey</span>
          </button>
        </div>
      </div>
    );
  }

  // ── INCOMING REQUEST: SIGN-IN ──
  if (view === 'auth') {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="passkey" subPage="auth" showDebugId={showDebugId} />
        {header('Sign-In Request')}
        <div className="flex-1 px-5 pt-4 flex flex-col min-h-0">
          <div className="mb-4">
            <div className={LABEL}>Sign In To</div>
            <div className="text-3xl font-bold text-black tracking-tight leading-tight break-all">{authKey.rpName}</div>
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 mb-3.5" />

          <div>
            <div className={LABEL}>Service</div>
            <div className="text-xl font-normal text-black font-mono break-all leading-snug">{authKey.rpId}</div>
          </div>
          <div className="mt-2.5">
            <div className={LABEL}>Passkey</div>
            <div className="text-xl font-normal text-black break-all leading-snug">{authKey.user}</div>
          </div>

          <div className="h-[2px] bg-black flex-shrink-0 my-3.5" />

          <p className="text-lg text-black leading-snug">
            Approving signs you in with the passkey stored on this device.
          </p>
        </div>

        <div className="mx-4 mt-3 mb-4 pt-3 border-t-2 border-black flex gap-2 flex-shrink-0">
          <button
            onClick={() => { setPending(null); setView('list'); }}
            className="w-[80px] h-[60px] border-2 border-black rounded-sm hover:bg-black group active:scale-[0.97] transition-all flex items-center justify-center flex-shrink-0"
            aria-label="Reject"
          >
            <X className="w-6 h-6 text-black group-hover:text-[#838383]" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => { setPending('auth'); setView('verify'); }}
            className="flex-1 h-[60px] bg-black rounded-sm hover:bg-[#222] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-6 h-6 text-[#838383]" strokeWidth={2.5} />
            <span className="text-lg font-bold text-[#838383] uppercase tracking-wide">Approve</span>
          </button>
        </div>
      </div>
    );
  }

  // ── DELETE CONFIRMATION ──
  if (view === 'delete' && selected) {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="passkey" subPage="delete" showDebugId={showDebugId} />
        {header('Delete Passkey')}
        <div className="flex-1 flex flex-col items-center justify-center p-5">
          <Trash2 className="w-12 h-12 text-black mb-3" strokeWidth={1.5} />
          <div className="text-xl font-bold text-black uppercase mb-2 text-center">
            Delete passkey for {selected.rpName}?
          </div>
          <div className="text-lg text-black text-center leading-snug mb-6 px-4">
            You may lose access to {selected.rpId} unless you have another sign-in method.
          </div>
          <div className="w-full space-y-3">
            <button
              onClick={() => {
                setPasskeys(prev => prev.filter(p => p.id !== selected.id));
                // Deleting may empty the last page — clamp so the list never
                // lands on a blank page.
                setListPage(p => Math.min(p, Math.max(0, Math.ceil((passkeys.length - 1) / KEYS_PER_PAGE) - 1)));
                setSelectedId(null);
                setView('list');
              }}
              className="w-full h-14 border-2 border-black rounded-sm bg-black text-[#838383] hover:bg-[#838383] hover:text-black active:scale-95 transition-all font-bold text-lg uppercase"
            >
              Delete Passkey
            </button>
            <button
              onClick={() => setView('detail')}
              className="w-full h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all font-bold text-lg uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL — flat field list + delete action ──
  if (view === 'detail' && selected) {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="passkey" subPage="detail" showDebugId={showDebugId} />
        {header(selected.rpName, () => { setSelectedId(null); setView('list'); })}
        <div className="flex-1 py-4 px-5 flex flex-col gap-4 min-h-0">
          <div>
            <div className={LABEL}>Service</div>
            <div className="text-xl font-normal text-black font-mono break-all leading-snug">{selected.rpId}</div>
          </div>
          <div>
            <div className={LABEL}>Username</div>
            <div className="text-2xl font-normal text-black break-all">{selected.user}</div>
          </div>
          <div>
            <div className={LABEL}>Display Name</div>
            <div className="text-2xl font-normal text-black break-all">{selected.displayName}</div>
          </div>
          <div>
            <div className={LABEL}>Key Algorithm</div>
            <div className="text-xl font-normal text-black font-mono">{selected.algorithm}</div>
          </div>
          <div>
            <div className={LABEL}>User Verification</div>
            <div className="text-xl font-normal text-black">{selected.uvRequired ? 'Always required' : 'Optional'}</div>
          </div>
          <div>
            <div className={LABEL}>Credential ID</div>
            <div className="text-xl font-normal text-black font-mono break-all leading-snug">{selected.credId}</div>
          </div>
        </div>
        <div className="mx-4 mt-3 mb-4 pt-3 border-t-2 border-black flex-shrink-0">
          <button
            onClick={() => setView('delete')}
            className="w-full h-[60px] border-2 border-black rounded-sm hover:bg-black group active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5 text-black group-hover:text-[#838383]" strokeWidth={2.5} />
            <span className="text-lg font-bold text-black group-hover:text-[#838383] uppercase tracking-wide">Delete Passkey</span>
          </button>
        </div>
      </div>
    );
  }

  // ── LIST (default) ──
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="passkey" subPage="list" showDebugId={showDebugId} />
      {header('Passkey', onBack, totalListPages > 1 ? (
        <span className="text-lg font-bold text-black tabular-nums">{listPage + 1}/{totalListPages}</span>
      ) : undefined)}
      <div className="flex-1 py-4 px-5 flex flex-col min-h-0">
        {/* Status — flat field */}
        <div className="mb-4">
          <div className={LABEL}>Authenticator</div>
          {/* Capacity is first-class in CTAP2.1 (getCredsMetadata), so show
              used-of-max rather than a bare count. */}
          <div className="text-2xl font-normal text-black">FIDO2 · {passkeys.length} of {MAX_PASSKEYS} passkeys</div>
        </div>

        {passkeys.length === 0 ? (
          /* Empty state — what this feature is for and how to get a first key.
             Dashed border = decorative tip card (CONSTRAINTS § 3.3). */
          <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0">
            <KeyRound className="w-12 h-12 text-black mb-3" strokeWidth={1.5} />
            <div className="text-xl font-bold text-black uppercase tracking-wide mb-2">No Passkeys Yet</div>
            <p className="text-lg text-black leading-snug mb-3">
              Use this device as a FIDO2 security key: passwordless sign-in, approved here with fingerprint or PIN.
            </p>
            <div className="border-2 border-black border-dashed rounded-sm p-3 text-left">
              <p className="text-lg text-black leading-snug">
                GitHub, Google and major exchanges (Binance, Coinbase, Kraken) support passkeys. Add one in the site's Security settings, then confirm on this device.
              </p>
            </div>
          </div>
        ) : (
        <>
        {/* Registered passkeys — interactive menu cards, paged whole
            (Sign History pattern: 4 per page, alphabetical by rp.id). */}
        <div className={LABEL}>Registered Passkeys</div>
        <div className="space-y-2.5">
          {pagedKeys.map(pk => (
            <button
              key={pk.id}
              onClick={() => { setSelectedId(pk.id); setView('detail'); }}
              className="w-full h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all px-4 flex items-center gap-3 group"
            >
              <KeyRound className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
              <div className="flex-1 min-w-0 flex items-baseline gap-2">
                <span className="text-lg font-bold whitespace-nowrap">{pk.rpName}</span>
                <span className="text-lg font-light truncate">{pk.user}</span>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
            </button>
          ))}
        </div>

        {/* Pagination — boundary buttons hide entirely (CONSTRAINTS § 3.2). */}
        {totalListPages > 1 && (
          <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t-2 border-black">
            {listPage > 0 && (
              <button
                onClick={() => setListPage(p => Math.max(0, p - 1))}
                className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-lg uppercase tracking-wide"
              >
                <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
                Prev
              </button>
            )}
            {listPage < totalListPages - 1 && (
              <button
                onClick={() => setListPage(p => Math.min(totalListPages - 1, p + 1))}
                className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-lg uppercase tracking-wide"
              >
                Next
                <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}
        </>
        )}

        {/* Demo triggers — stand-ins for requests arriving over BLE/NFC/USB.
            Clear empties the store so the empty state is previewable; Sign-In
            is disabled (invisible label, § 3.1) when there is no credential
            to sign with. */}
        <div className="mt-auto">
          <div className={LABEL}>Demo · Incoming Requests</div>
          <div className="flex gap-2.5">
            <button
              onClick={() => setView('auth')}
              disabled={passkeys.length === 0}
              className={`flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] font-bold text-lg uppercase tracking-wide ${
                passkeys.length === 0 ? 'cursor-default' : 'hover:bg-black hover:text-[#838383] active:scale-95 transition-all'
              }`}
            >
              <span className={passkeys.length === 0 ? 'invisible' : ''}>Sign-In</span>
            </button>
            <button
              onClick={() => setView('register')}
              className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all font-bold text-lg uppercase tracking-wide"
            >
              Register
            </button>
            <button
              onClick={() => { setPasskeys([]); setListPage(0); }}
              disabled={passkeys.length === 0}
              className={`flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] font-bold text-lg uppercase tracking-wide ${
                passkeys.length === 0 ? 'cursor-default' : 'hover:bg-black hover:text-[#838383] active:scale-95 transition-all'
              }`}
            >
              <span className={passkeys.length === 0 ? 'invisible' : ''}>Clear</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
