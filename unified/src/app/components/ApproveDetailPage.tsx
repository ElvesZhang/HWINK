import { DetailListView, BoldEndsAddress, PreciseAmount, type DetailField } from './DetailListView';

export interface ApproveDetail {
  id: string;
  coin: string;
  network: string;
  spender: string;
  spenderName?: string;
  /** The owner's address granting the approval (shown as "Your Address"). */
  address?: string;
  amount: string;
  usdValue: string;
  gasLimit: string;
  gasFee: string;
  gasFeeUsd: string;
  totalUsd: string;
  timestamp: string;
  status: 'completed' | 'rejected';
  isUnlimited?: boolean;
  /** Serialized signed payload (raw approve calldata). Trailing flow field. */
  rawData?: string;
}

interface ApproveDetailPageProps {
  onBack: () => void;
  detail: ApproveDetail;
}

/** History detail for a past approval. Field set mirrors the signing-time
 *  Approve Full Details exactly (Approved Amount / Token / Spender / Your
 *  Address / Gas Limit / Network Fee) — the history detail only ADDS Time. */
export function ApproveDetailPage({ onBack, detail }: ApproveDetailPageProps) {
  const fields: DetailField[] = [
    { label: 'Time', value: <div className="text-xl font-normal text-black">{detail.timestamp}</div> },
    {
      label: 'Approved Amount',
      value: detail.isUnlimited
        ? <div className="text-xl font-normal text-black">UNLIMITED</div>
        : <PreciseAmount amount={detail.amount} token={detail.coin} />,
    },
    { label: 'Token', value: <div className="text-xl font-normal text-black">{detail.coin} ({detail.network})</div> },
    {
      label: 'Spender',
      value: (
        <>
          {detail.spenderName && <div className="text-xl font-normal text-black break-all leading-snug mb-1">{detail.spenderName}</div>}
          <BoldEndsAddress addr={detail.spender} className="text-xl text-black break-all leading-snug" />
        </>
      ),
    },
    ...(detail.address
      ? [{ label: 'Your Address', value: <BoldEndsAddress addr={detail.address} className="text-xl text-black break-all leading-snug" /> }]
      : []),
    { label: 'Gas Limit', value: <div className="text-xl font-normal text-black">{detail.gasLimit}</div> },
    { label: 'Network Fee', value: <div className="text-xl font-normal text-black break-all">{detail.gasFee} ETH</div> },
    // Raw signed payload — flow field, always last.
    ...(detail.rawData
      ? [{ label: 'Raw Data', flow: true, value: <div className="text-xl font-normal text-black break-all leading-snug">{detail.rawData}</div> }]
      : []),
  ];

  return <DetailListView title="Approve" onBack={onBack} fields={fields} dataKey={detail.id} />;
}
