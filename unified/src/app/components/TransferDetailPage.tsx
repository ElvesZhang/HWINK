import { DetailListView, BoldEndsAddress, PreciseAmount, type DetailField } from './DetailListView';

export interface TransferDetail {
  id: string;
  coin: string;
  network: string;
  from: string;
  to: string;
  amount: string;
  usdValue: string;
  gasLimit: string;
  gasFee: string;
  gasFeeUsd: string;
  totalAmount: string;
  totalUsd: string;
  timestamp: string;
  status: 'completed' | 'rejected';
  txHash?: string;
}

interface TransferDetailPageProps {
  onBack: () => void;
  detail: TransferDetail;
}

/** History detail for a past transfer — same signature-type detail as the
 *  Transfer signing screen, so it uses the shared DetailListView pattern. */
export function TransferDetailPage({ onBack, detail }: TransferDetailPageProps) {
  // Field set mirrors the signing-time Full Details (From / To / Amount / Token
  // / Gas Limit / Network Fee) plus the history extras: Time leads (it's what
  // identifies the record), the broadcast hash trails.
  const fields: DetailField[] = [
    { label: 'Time', value: <div className="text-xl font-normal text-black">{detail.timestamp}</div> },
    { label: 'From', value: <BoldEndsAddress addr={detail.from} className="text-xl text-black font-mono break-all leading-snug" /> },
    { label: 'To', value: <BoldEndsAddress addr={detail.to} className="text-xl text-black font-mono break-all leading-snug" /> },
    { label: 'Amount', value: <PreciseAmount amount={detail.amount} /> },
    { label: 'Token', value: <div className="text-2xl font-normal text-black">{detail.coin} ({detail.network})</div> },
    { label: 'Gas Limit', value: <div className="text-2xl font-normal text-black font-mono">{detail.gasLimit}</div> },
    { label: 'Network Fee', value: <div className="text-2xl font-normal text-black font-mono break-all">{detail.gasFee} {detail.coin}</div> },
    // Type-specific extras beyond the signing-time set: the broadcast receipt.
    ...(detail.txHash
      ? [{ label: 'Transaction Hash', value: <div className="text-xl font-normal text-black font-mono break-all leading-snug">{detail.txHash}</div> }]
      : []),
  ];

  return <DetailListView title="Transfer" onBack={onBack} fields={fields} dataKey={detail.id} />;
}
