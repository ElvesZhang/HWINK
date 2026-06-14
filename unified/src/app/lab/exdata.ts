/** Shared content/logic for the ⑦ strong-style explorations (Receipt / Spread)
 *  so History / Seed / Verify don't duplicate data across style files. */

export type Rec = { id: string; type: 'transfer' | 'approve' | 'sign'; coin: string; network: string; amount: string; usdValue: string; timestamp: string; status: 'completed' | 'rejected'; requestedByName?: string };
export const RECORDS: Rec[] = [
  { id: '1', type: 'transfer', coin: 'BTC', network: 'Bitcoin', amount: '0.0234', usdValue: '2,145.67', timestamp: '2026-02-28 14:23:15', status: 'completed' },
  { id: '2', type: 'sign', coin: 'ETH', network: 'Ethereum', amount: '0', usdValue: '0', timestamp: '2026-02-28 13:05:22', status: 'completed', requestedByName: 'OpenSea' },
  { id: '3', type: 'approve', coin: 'GOV', network: 'Polygon', amount: '123,456.78', usdValue: '9,876,543.21', timestamp: '2026-02-28 12:18:45', status: 'completed' },
  { id: '4', type: 'transfer', coin: 'WBTC', network: 'Optimism', amount: '0.045', usdValue: '4,125.50', timestamp: '2026-02-28 11:45:32', status: 'completed' },
  { id: '5', type: 'sign', coin: 'BTC', network: 'Bitcoin', amount: '0', usdValue: '0', timestamp: '2026-02-27 20:33:18', status: 'rejected', requestedByName: 'Uniswap' },
  { id: '6', type: 'transfer', coin: 'USDT', network: 'Ethereum', amount: '500.00', usdValue: '500.00', timestamp: '2026-02-27 18:12:08', status: 'completed' },
  { id: '7', type: 'approve', coin: 'CRV', network: 'Arbitrum', amount: '50,000.12', usdValue: '125,000.50', timestamp: '2026-02-27 09:34:21', status: 'completed' },
  { id: '8', type: 'transfer', coin: 'BTC', network: 'Bitcoin', amount: '0.0089', usdValue: '816.43', timestamp: '2026-02-26 16:55:47', status: 'rejected' },
  { id: '9', type: 'transfer', coin: 'USDC', network: 'Polygon', amount: '1,000.00', usdValue: '1,000.00', timestamp: '2026-02-25 13:22:19', status: 'completed' },
  { id: '10', type: 'approve', coin: 'UNI', network: 'Ethereum', amount: '50.00', usdValue: '425.50', timestamp: '2026-02-24 10:08:33', status: 'completed' },
];
export const formatAmount = (a: string): string => {
  const n = parseFloat(a.replace(/,/g, ''));
  if (isNaN(n)) return a;
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 10000) return (n / 1000).toFixed(2) + 'K';
  if (n < 1) return n.toFixed(4).replace(/\.?0+$/, '');
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
};
export const typeLabel = (t: string) => (t === 'transfer' ? 'Transfer' : t === 'approve' ? 'Approve' : 'Sign');
export const fmtTs = (ts: string) => { const [d, t] = ts.split(' '); return `${d} · ${(t || '').slice(0, 5)}`; };
export const recPrimary = (r: Rec) => (r.amount !== '0' ? `${formatAmount(r.amount)} ${r.coin}` : (r.requestedByName || 'Unknown'));
export const recSub = (r: Rec) => (r.type === 'sign' ? `Sign · ${r.network}` : `${typeLabel(r.type)} · ${r.network}${r.usdValue !== '0' ? ` · $${formatAmount(r.usdValue)}` : ''}`);

/* ── Seed: Activation re-enter picker ── */
export const PHRASE = ['abandon', 'bacon', 'cabin', 'damage', 'eager', 'fabric', 'gadget', 'habit', 'ice', 'label', 'machine', 'oak'];
const DISTRACTORS = ['ability', 'badge', 'cable', 'dance', 'eagle', 'face', 'gain', 'hair', 'icon', 'lake', 'magic', 'object', 'safe', 'table', 'access', 'balance', 'cargo', 'deer', 'early', 'faith'];
export function pickOptions(correct: string, index: number): string[] {
  const start = (index * 3) % DISTRACTORS.length;
  const ds = DISTRACTORS.filter(w => w !== correct).slice(start, start + 3);
  while (ds.length < 3) ds.push(DISTRACTORS[(ds.length + index) % DISTRACTORS.length]);
  const opts = [correct, ...ds];
  const pos = index % 4;
  [opts[0], opts[pos]] = [opts[pos], opts[0]];
  return opts;
}

/* ── Verify: bip39 prefix-filtered keyboard ── */
export const BIP39 = [
  'abandon', 'ability', 'able', 'about', 'access', 'acid', 'across', 'action',
  'bacon', 'badge', 'balance', 'bamboo', 'banana', 'bargain', 'basic', 'beauty',
  'cabin', 'cable', 'cactus', 'cake', 'camera', 'canal', 'cargo', 'castle',
  'damage', 'dance', 'dawn', 'deal', 'debate', 'decide', 'deer', 'desert',
  'eager', 'eagle', 'early', 'earn', 'east', 'echo', 'edit', 'effort',
  'fabric', 'face', 'faculty', 'fade', 'faith', 'famous', 'fancy', 'fault',
  'gadget', 'gain', 'galaxy', 'gallery', 'garden', 'garlic', 'gather', 'gesture',
  'habit', 'hair', 'half', 'hammer', 'happy', 'harbor', 'hazard', 'health',
  'ice', 'icon', 'idea', 'identify', 'idle', 'image', 'impose', 'income',
  'lab', 'label', 'labor', 'ladder', 'lake', 'lamp', 'laptop', 'laundry',
  'machine', 'magic', 'magnet', 'major', 'mango', 'mansion', 'marble', 'march',
  'oak', 'obey', 'object', 'oblige', 'ocean', 'october', 'offer', 'olive',
  'sad', 'saddle', 'safe', 'sail', 'salad', 'salmon', 'sample', 'satisfy',
  'table', 'tackle', 'tag', 'tail', 'talent', 'tank', 'target', 'taste',
];
export const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
