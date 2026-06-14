import { DetailListView, BoldEndsAddress, type DetailField } from './DetailListView';

export interface BlindDetail {
  id: string;
  network: string;
  methodId: string;
  contractAddress: string;
  rawData: string;
  timestamp: string;
  txHash?: string;
}

interface BlindDetailPageProps {
  onBack: () => void;
  detail: BlindDetail;
}

/** History detail for a past blind signature. Field set mirrors the signing-time
 *  Blind details (Network / Method ID / Contract / Raw Data) plus the history
 *  extras: Time leads, the broadcast hash before the raw payload. The raw data
 *  is a `flow` field so any length pages without clipping. */
export function BlindDetailPage({ onBack, detail }: BlindDetailPageProps) {
  const fields: DetailField[] = [
    { label: 'Time', value: <div className="text-xl font-normal text-black">{detail.timestamp}</div> },
    { label: 'Network', value: <div className="text-2xl font-normal text-black">{detail.network}</div> },
    { label: 'Method ID', value: <div className="text-2xl font-normal text-black font-mono break-all">{detail.methodId}</div> },
    { label: 'Contract', value: <BoldEndsAddress addr={detail.contractAddress} className="text-xl text-black font-mono break-all leading-snug" /> },
    ...(detail.txHash
      ? [{ label: 'Transaction Hash', value: <div className="text-xl font-normal text-black font-mono break-all leading-snug">{detail.txHash}</div> }]
      : []),
    {
      label: 'Raw Data',
      flow: true,
      value: <div className="text-xl font-normal text-black font-mono break-all leading-snug">{detail.rawData}</div>,
    },
  ];

  return <DetailListView title="Blind Sign" onBack={onBack} fields={fields} dataKey={detail.id} />;
}
