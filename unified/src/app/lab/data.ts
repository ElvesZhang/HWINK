/** Shared content for the Lab style explorations (so every style renders the
 *  same wallet data, only the presentation differs). */

export type LabScreen = 'home' | 'sign' | 'history' | 'seed' | 'verify';
export type LabStyle = 'poster' | 'receipt' | 'flow' | 'spread' | 'minimaldrill' | 'minimaldense' | 'clarity' | 'refined' | 'p1' | 'p3' | 'traditional' | 'tradtech' | 'tradtime' | 'composite' | 'editorial' | 'label' | 'techwear' | 'hud' | 'fono' | 'bento' | 'serif' | 'sketch' | 'shadow'
  // ── 2026-06 new batch — each occupies a previously-unused composition cell (see styleMeta.ts) ──
  | 'manuscript' | 'dial' | 'ticket' | 'ledger' | 'timeline' | 'broadsheet'
  // ── 2026-06 illustration batch — explores the illustration-aesthetic axis (see styleMeta.ts) ──
  | 'engraving' | 'pictograph' | 'woodcut' | 'infographic'
  // ── 2026-06 clean lucide-style icon experiment ──
  | 'lineicon';

export const WALLET = {
  name: 'ELVES-5DW',
  model: 'SAFEPAL OBSIDIAN',
  battery: 78,
  networks: 3,
  tokens: 12,
};

export type HomeItem = { id: string; label: string; sub: string; code: string };
export const HOME_ITEMS: HomeItem[] = [
  { id: 'assets', label: 'Assets', sub: '3 networks · 12 tokens', code: 'AST-12' },
  { id: 'history', label: 'History', sub: '6 signatures today', code: 'HIS-06' },
  { id: 'passkey', label: 'Passkey', sub: 'FIDO2 enabled', code: 'KEY-F2' },
  { id: 'settings', label: 'Settings', sub: 'Device & security', code: 'SET-00' },
];

export type HistEntry = {
  idx: string; date: string; time: string; title: string; sub: string;
  type: string; ok: boolean; kind: 'sent' | 'signed'; detail: [string, string][];
};
export const HIST: HistEntry[] = [
  { idx: '01', date: 'Jan 27', time: '14:32', title: '500 USDT', sub: 'To My Ledger', type: 'Transfer', ok: true, kind: 'sent', detail: [['To', 'My Ledger'], ['Address', '0x8Ba1…dBA72'], ['Network fee', '0.0008 ETH'], ['Tx hash', '0x9f2c…a1b2']] },
  { idx: '02', date: 'Jan 27', time: '14:01', title: '1,000 USDT', sub: 'Uniswap Router', type: 'Approve', ok: true, kind: 'sent', detail: [['Spender', 'Uniswap V3 Router'], ['Allowance', '1,000 USDT'], ['Network fee', '0.0006 ETH'], ['Tx hash', '0x77ab…9c3d']] },
  { idx: '03', date: 'Jan 26', time: '12:47', title: 'Uniswap login', sub: 'Plain message', type: 'Sign', ok: false, kind: 'signed', detail: [['dApp', 'app.uniswap.org'], ['Type', 'Plain message'], ['Result', 'Rejected by user']] },
  { idx: '04', date: 'Mar 14', time: '09:20', title: '1,000 USDT', sub: 'USDT → TRX', type: 'Swap', ok: true, kind: 'sent', detail: [['Pair', 'USDT → TRX'], ['Rate', '1 USDT ≈ 7.4 TRX'], ['Network fee', '1.2 TRX'], ['Tx hash', '0x55de…77a0']] },
  { idx: '05', date: 'Mar 12', time: '18:05', title: 'Raw transaction', sub: 'Contract call', type: 'Blind', ok: true, kind: 'signed', detail: [['Contract', '0x44Ab…0F12'], ['Method', '0xa9059cbb'], ['Tx hash', '0x22c1…b830']] },
];

export const SIGN = {
  amount: '500',
  token: 'USDT',
  fiat: '$500.00',
  to: 'My Ledger',
  address: 'TJYx…Lk9p',
  fee: '13.5 TRX',
  network: 'TRON',
  verify: '748392',
};

export const SEED = {
  count: 12,
  current: 3,
  entered: ['abandon', 'ability', 'access'],
  suggestions: ['bacon', 'badge', 'balance'],
};
