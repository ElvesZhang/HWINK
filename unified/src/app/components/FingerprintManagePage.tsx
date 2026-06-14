import { useState } from 'react';
import { ChevronLeft, Fingerprint, Trash2 } from 'lucide-react';
import { PageDebugId } from './PageDebugId';

interface FingerprintManagePageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

type FingerprintState = 'list' | 'add-pin' | 'scanning' | 'success';

export function FingerprintManagePage({ onBack, showDebugId }: FingerprintManagePageProps) {
  const [state, setState] = useState<FingerprintState>('list');
  const [fingerprints, setFingerprints] = useState<FingerprintData[]>([
    { id: 1, name: 'Finger 1', enrolled: true },
    { id: 2, name: 'Finger 2', enrolled: false },
    { id: 3, name: 'Finger 3', enrolled: false },
    { id: 4, name: 'Finger 4', enrolled: false },
  ]);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleEnroll = (id: number) => {
    setEnrollingId(id);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setFingerprints(fps => fps.map(fp => 
            fp.id === id ? { ...fp, enrolled: true } : fp
          ));
          setTimeout(() => {
            setEnrollingId(null);
          }, 500);
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  const handleDelete = (id: number) => {
    setFingerprints(fps => fps.map(fp => 
      fp.id === id ? { ...fp, enrolled: false } : fp
    ));
    setDeletingId(null);
  };

  if (enrollingId !== null) {
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        <PageDebugId page="fingerprint" subPage="scanning" showDebugId={showDebugId} />
        {/* Header */}
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-lg font-bold text-black uppercase tracking-wide">Enrolling...</span>
        </div>

        {/* Enrollment Progress */}
        <div className="flex-1 flex flex-col items-center justify-center p-5">
          <Fingerprint className="w-24 h-24 text-black mb-6" strokeWidth={2} />
          
          <div className="text-xl font-bold text-black uppercase mb-2">
            Touch Sensor
          </div>
          <div className="text-lg text-black mb-2">
            Enrolling {fingerprints.find(f => f.id === enrollingId)?.name}
          </div>
          <div className="text-lg text-black mb-6">
            Lift and place your finger repeatedly
          </div>

          {/* Progress Bar */}
          <div className="w-full h-10 border-2 border-black rounded-sm bg-[#838383] mb-2">
            <div 
              className="h-full bg-black transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-lg font-bold text-black">{progress}%</div>
        </div>
      </div>
    );
  }

  if (deletingId !== null) {
    const finger = fingerprints.find(f => f.id === deletingId);
    return (
      <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
        {/* Header */}
        <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
          <span className="text-lg font-bold text-black uppercase tracking-wide">Confirm Delete</span>
        </div>

        {/* Confirmation */}
        <div className="flex-1 flex flex-col items-center justify-center p-5">
          <Fingerprint className="w-24 h-24 text-black mb-6" strokeWidth={2} />
          
          <div className="text-xl font-bold text-black uppercase mb-2">
            Delete {finger?.name}?
          </div>
          <div className="text-lg text-black mb-6 text-center px-4">
            This fingerprint will be removed and can no longer be used for authentication.
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={() => handleDelete(deletingId)}
              className="w-full h-14 border-2 border-black rounded-sm bg-black text-[#838383] hover:bg-[#838383] hover:text-black active:scale-95 transition-all font-bold text-lg uppercase"
            >
              Delete
            </button>
            <button
              onClick={() => setDeletingId(null)}
              className="w-full h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all font-bold text-lg uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="fingerprint" subPage="list" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Manage Fingerprints</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-black uppercase mb-2">Enrolled Fingerprints</h2>
          <p className="text-lg text-black">
            You can enroll up to 4 fingerprints
          </p>
        </div>

        {/* Fingerprint List */}
        <div className="space-y-3 flex-1">
          {fingerprints.map((finger) => (
            <div
              key={finger.id}
              className="border-2 border-black rounded-sm p-4 bg-[#838383] flex items-center gap-4"
            >
              <Fingerprint className="w-8 h-8 text-black flex-shrink-0" strokeWidth={2} />
              
              <div className="flex-1">
                <div className="text-lg font-bold text-black uppercase">{finger.name}</div>
                <div className="text-lg text-black">
                  {finger.enrolled ? 'Enrolled' : 'Not enrolled'}
                </div>
              </div>

              {finger.enrolled ? (
                <button
                  onClick={() => setDeletingId(finger.id)}
                  className="h-12 px-4 border-2 border-black bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-lg font-bold uppercase">Delete</span>
                </button>
              ) : (
                <button
                  onClick={() => handleEnroll(finger.id)}
                  className="h-12 px-4 border-2 border-black bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all"
                >
                  <span className="text-lg font-bold uppercase">Enroll</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}