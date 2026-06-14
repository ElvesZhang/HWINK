import { DetailListView, BoldEndsAddress, type DetailField } from './DetailListView';

export interface SignMessageDetail {
  id: string;
  network: string;
  /** The signing address used for this message. */
  requestedBy: string;
  requestedByName?: string;
  /** DApp URL (mirrors the signing-time URL field). */
  url?: string;
  timestamp: string;
  rawMessage: string;
  messageType: 'text' | 'hex';
  status: 'completed' | 'rejected';
  txHash?: string;
}

interface SignMessageDetailPageProps {
  onBack: () => void;
  detail: SignMessageDetail;
}

/** History detail for a past message signature — same signature-type detail as
 *  the Sign Message screen. The (possibly long) message is a `flow` field so it
 *  scrolls across pages, never clipped. */
export function SignMessageDetailPage({ onBack, detail }: SignMessageDetailPageProps) {
  const formattedMessage = detail.messageType === 'hex' && !detail.rawMessage.startsWith('0x')
    ? '0x' + detail.rawMessage
    : detail.rawMessage;

  // Field set mirrors the signing-time Message details exactly (DApp / URL /
  // Network / Signing Address / Message) — the history detail only ADDS Time.
  const fields: DetailField[] = [
    { label: 'Time', value: <div className="text-xl font-normal text-black">{detail.timestamp}</div> },
    { label: 'DApp', value: <div className="text-2xl font-normal text-black break-all">{detail.requestedByName || 'Unknown'}</div> },
    ...(detail.url
      ? [{ label: 'URL', value: <div className="text-xl font-normal text-black break-all leading-snug">{detail.url}</div> }]
      : []),
    { label: 'Network', value: <div className="text-2xl font-normal text-black">{detail.network}</div> },
    { label: 'Signing Address', value: <BoldEndsAddress addr={detail.requestedBy} className="text-xl text-black font-mono break-all leading-snug" /> },
    // Type-specific extras beyond the signing-time set.
    { label: 'Message Type', value: <div className="text-2xl font-normal text-black uppercase">{detail.messageType === 'hex' ? 'Hexadecimal Data' : 'Plain Text'}</div> },
    ...(detail.txHash
      ? [{ label: 'Signature Hash', value: <div className="text-xl font-normal text-black font-mono break-all leading-snug">{detail.txHash}</div> }]
      : []),
    {
      label: 'Message',
      flow: true,
      value: <div className={`text-xl font-normal text-black ${detail.messageType === 'hex' ? 'font-mono' : ''} whitespace-pre-wrap break-all leading-snug`}>{formattedMessage}</div>,
    },
  ];

  return <DetailListView title="Sign Message" onBack={onBack} fields={fields} dataKey={detail.id} />;
}
