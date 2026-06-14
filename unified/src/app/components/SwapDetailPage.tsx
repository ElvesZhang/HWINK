import { DetailListView, BoldEndsAddress, PreciseAmount, type DetailField } from './DetailListView';

export interface SwapDetail {
  id: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  network: string;
  from: string;
  contractName: string;
  contractAddress: string;
  method: string;
  fee: string;
  feeToken: string;
  timestamp: string;
  txHash?: string;
}

interface SwapDetailPageProps {
  onBack: () => void;
  detail: SwapDetail;
}

/** History detail for a past swap. Field set mirrors the signing-time Swap Full
 *  Details (Pay / Receive / From / Contract / Method / Network Fee) plus the
 *  history extras: Time leads, the broadcast hash trails. */
export function SwapDetailPage({ onBack, detail }: SwapDetailPageProps) {
  const fields: DetailField[] = [
    { label: 'Time', value: <div className="text-xl font-normal text-black">{detail.timestamp}</div> },
    { label: 'Pay', value: <PreciseAmount amount={detail.amountIn} token={detail.tokenIn} network={detail.network} /> },
    { label: 'Receive', value: <PreciseAmount amount={detail.amountOut} token={detail.tokenOut} network={detail.network} /> },
    { label: 'From', value: <BoldEndsAddress addr={detail.from} className="text-xl text-black font-mono break-all leading-snug" /> },
    { label: 'Contract', value: (
      <>
        <div className="text-xl font-normal text-black break-all leading-snug mb-1">{detail.contractName}</div>
        <BoldEndsAddress addr={detail.contractAddress} className="text-xl text-black font-mono break-all leading-snug" />
      </>
    ) },
    { label: 'Method', value: <div className="text-xl font-normal text-black break-all leading-snug">{detail.method}</div> },
    { label: 'Network Fee', value: <div className="text-2xl font-normal text-black font-mono break-all">{detail.fee} {detail.feeToken}</div> },
    ...(detail.txHash
      ? [{ label: 'Transaction Hash', value: <div className="text-xl font-normal text-black font-mono break-all leading-snug">{detail.txHash}</div> }]
      : []),
  ];

  return <DetailListView title="Swap" onBack={onBack} fields={fields} dataKey={detail.id} />;
}
