import { PageDebugId } from './PageDebugId';
import { DetailListView, type DetailField } from './DetailListView';

interface FirmwareInfoPageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

// Mock device identity. Real hardware would read these from secure storage.
// `version` is kept in sync with FirmwareUpdatePage's CURRENT_VERSION.
const firmwareInfo = {
  model: 'SafePal Obsidian',
  version: 'v2.1.5',
  serialNumber: 'OBS-7F3A-9C21-E84D',
  activationDate: '2026-03-14',
  activationTime: '14:32 UTC',
};

/** Device info as a peer-field list — same pattern as the Sign History details
 *  (quiet light label over a normal-weight value, no boxed cards). */
export function FirmwareInfoPage({ onBack, showDebugId }: FirmwareInfoPageProps) {
  const fields: DetailField[] = [
    { label: 'Device Model', value: <div className="text-2xl font-normal text-black">{firmwareInfo.model}</div> },
    { label: 'Firmware Version', value: <div className="text-2xl font-normal text-black">{firmwareInfo.version}</div> },
    { label: 'Serial Number', value: <div className="text-xl font-normal text-black font-mono break-all leading-snug">{firmwareInfo.serialNumber}</div> },
    { label: 'First Activation', value: <div className="text-xl font-normal text-black">{firmwareInfo.activationDate} {firmwareInfo.activationTime}</div> },
    { label: 'Note', value: <div className="text-xl font-normal text-black leading-snug">Keep serial number private for security.</div> },
  ];

  return (
    <>
      <PageDebugId page="firmware-info" showDebugId={showDebugId} />
      <DetailListView title="Firmware Info" onBack={onBack} fields={fields} dataKey="firmware-info" />
    </>
  );
}
