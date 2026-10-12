import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { selectionTrialsApi } from '../lib/api/selectionTrials';
import { 
  QrCode, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  RefreshCw, 
  UserCheck, 
  Clock,
  ShieldCheck,
  Download,
  X
} from 'lucide-react';

interface ScannedRecord {
  token: string;
  name?: string;
  rollNumber?: string;
  program?: string;
  branch?: string;
  year?: string;
  gender?: string;
  phone?: string;
  trialTitle?: string;
  sessionTitle?: string;
  previousParticipation?: string;
  timestamp: string;
  status: 'success' | 'error';
  message: string;
}

export const QrScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScannedRecord[]>([]);
  const [lastSuccess, setLastSuccess] = useState<ScannedRecord | null>(null);
  const [processing, setProcessing] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'qr-reader-viewport';

  // Process a scanned student ID card QR or pass token
  const processToken = async (token: string) => {
    const trimmed = token.trim();
    if (!trimmed || processing) return;

    setProcessing(true);
    // Parse roll number if encoded in URL or raw text
    const rollMatch = trimmed.match(/[0-9]{2}[A-Za-z0-9]{8}/i);
    const parsedRoll = rollMatch ? rollMatch[0].toUpperCase() : trimmed.toUpperCase();

    try {
      const result = await selectionTrialsApi.coachMarkAttendance(trimmed);
      
      const record: ScannedRecord = {
        token: trimmed,
        name: result.student_name || 'Athlete',
        rollNumber: result.roll_no || parsedRoll,
        program: result.program || 'B.Tech',
        branch: result.branch,
        year: result.year,
        gender: result.gender,
        phone: result.phone,
        trialTitle: result.trial_title,
        sessionTitle: result.session_title,
        previousParticipation: result.previous_participation,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: 'success',
        message: 'Attendance Verified & Stored'
      };

      setLastSuccess(record);
      setRecentScans(prev => [record, ...prev.slice(0, 49)]);
      setManualToken('');

      // Auto-clear success banner after 8 seconds
      setTimeout(() => {
        setLastSuccess(prev => prev?.token === trimmed ? null : prev);
      }, 8000);
    } catch (err: any) {
      const record: ScannedRecord = {
        token: trimmed,
        rollNumber: parsedRoll,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: 'error',
        message: err.message || 'Verification Failed: No trial registration found for scanned ID.'
      };
      setRecentScans(prev => [record, ...prev.slice(0, 49)]);
    } finally {
      setProcessing(false);
    }
  };

  // Start Camera Scanning
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(qrRegionId);
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraError('No camera found on this device. Please enter the pass token manually.');
        return;
      }

      // Prefer back camera if on mobile
      const backCamera = cameras.find(c => c.label.toLowerCase().includes('back')) || cameras[0];

      await scannerRef.current.start(
        backCamera.id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          processToken(decodedText);
        },
        () => {
          // Ignore transient frames
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      setCameraError(err.message || 'Failed to start camera. Please verify camera permissions.');
      setIsScanning(false);
    }
  };

  // Stop Camera Scanning
  const stopCamera = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
      }
    } catch {
      // Ignored
    } finally {
      setIsScanning(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    startCamera();
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#F5F7FA] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-xl bg-[#0B0F17] hover:bg-[#121824] border border-[#1E293B] text-[#8B95A7] hover:text-[#F5F7FA] transition-colors cursor-pointer"
              title="Return to Admin Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <img 
                src="/svec-logo.png" 
                alt="SVEC Logo" 
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-base sm:text-lg font-heading font-black tracking-tight text-[#F5F7FA]">
                  ATHLETE PASS SCANNER
                </h1>
                <p className="text-xs text-[#8B95A7]">
                  Sri Vasavi Sports Club • Live Attendance Gate Console
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/admin"
            className="px-3 py-1.5 rounded-lg bg-[#121824] border border-[#1E293B] hover:border-[#B8FF3D]/40 text-xs font-semibold text-[#CBD5E1] transition-colors"
          >
            Admin Console
          </Link>
        </div>

        {/* Scanned Student ID Verification Card */}
        {lastSuccess && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B101D] border-2 border-[#B8FF3D] text-[#F5F7FA] shadow-2xl shadow-[#B8FF3D]/10 animate-fade-in space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#B8FF3D] text-[#070A0F] flex items-center justify-center font-black shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ID CARD VERIFIED
                    </span>
                    <span className="text-xs text-[#8B95A7]">
                      Scanned at {lastSuccess.timestamp}
                    </span>
                  </div>
                  <h3 className="text-lg font-heading font-black text-[#F5F7FA] mt-0.5">
                    {lastSuccess.name}
                  </h3>
                </div>
              </div>

              {/* Prominent Roll Number Display */}
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#121927] border border-[#B8FF3D]/50 text-right">
                  <div className="text-[9px] font-bold text-[#8B95A7] uppercase tracking-wider">
                    STUDENT ROLL NO
                  </div>
                  <div className="text-base font-mono font-black text-[#B8FF3D] tracking-wide">
                    {lastSuccess.rollNumber}
                  </div>
                </div>
                <button 
                  onClick={() => setLastSuccess(null)}
                  className="p-1.5 rounded-lg bg-[#121927] text-[#8B95A7] hover:text-[#F5F7FA] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Registration Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#070A0F] border border-[#161F30]">
                <span className="text-[10px] text-[#64748B] block font-medium">Program & Branch</span>
                <span className="font-semibold text-[#CBD5E1] truncate block mt-0.5">
                  {lastSuccess.program || 'B.Tech'} • {lastSuccess.branch || 'General'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#070A0F] border border-[#161F30]">
                <span className="text-[10px] text-[#64748B] block font-medium">Year & Gender</span>
                <span className="font-semibold text-[#CBD5E1] block mt-0.5">
                  {lastSuccess.year ? `${lastSuccess.year} Year` : '—'} • {lastSuccess.gender || '—'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#070A0F] border border-[#161F30]">
                <span className="text-[10px] text-[#64748B] block font-medium">Contact Phone</span>
                <span className="font-mono text-[#CBD5E1] block mt-0.5">
                  {lastSuccess.phone || 'N/A'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#070A0F] border border-[#161F30]">
                <span className="text-[10px] text-[#64748B] block font-medium">Trial Session</span>
                <span className="font-semibold text-[#B8FF3D] truncate block mt-0.5">
                  {lastSuccess.trialTitle || 'Active Selection Trial'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Scanner Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Camera Viewport (Left / Top) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl bg-[#0B0F17] border border-[#1E293B] overflow-hidden p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F7FA]">
                  <Camera className="w-4 h-4 text-[#B8FF3D]" />
                  <span>Live Video Feed</span>
                </div>
                <div className="flex items-center gap-2">
                  {isScanning ? (
                    <button
                      onClick={stopCamera}
                      className="px-2.5 py-1 rounded-lg bg-[#FF3B30]/20 text-[#FF3B30] text-xs font-semibold hover:bg-[#FF3B30]/30 transition-colors cursor-pointer"
                    >
                      Pause Camera
                    </button>
                  ) : (
                    <button
                      onClick={startCamera}
                      className="px-2.5 py-1 rounded-lg bg-[#B8FF3D] text-[#070A0F] text-xs font-bold hover:bg-[#a6ed28] transition-colors cursor-pointer"
                    >
                      Start Camera
                    </button>
                  )}
                </div>
              </div>

              {/* QR Reader DOM Element */}
              <div 
                id={qrRegionId} 
                className="w-full min-h-[300px] rounded-xl overflow-hidden bg-[#070A0F] flex items-center justify-center"
              />

              {cameraError && (
                <div className="mt-3 p-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              <p className="mt-3 text-center text-xs text-[#8B95A7]">
                Point camera at the QR code / barcode on the backside of the student's physical ID card or digital pass.
              </p>
            </div>

            {/* Manual Roll Number / Token Fallback */}
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-2">
              <label className="block text-xs font-semibold text-[#CBD5E1]">
                Manual Student Roll Number / Pass Token Entry
              </label>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  processToken(manualToken);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Enter Student Roll No (e.g. 24A81A0501) or Token..."
                  className="flex-1 px-3 py-2 bg-[#070A0F] border border-[#1E293B] rounded-xl text-xs text-[#F5F7FA] font-mono focus:outline-none focus:border-[#B8FF3D] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!manualToken.trim() || processing}
                  className="px-4 py-2 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  {processing ? 'Verifying...' : 'Check In'}
                </button>
              </form>
            </div>

          </div>

          {/* Recent Scans Session Log (Right) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-heading font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#B8FF3D]" />
                <span>Session Activity Log</span>
              </h2>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8B95A7]">
                  {recentScans.filter(s => s.status === 'success').length} Checked In
                </span>

                {recentScans.some(s => s.status === 'success') && (
                  <button
                    onClick={() => {
                      const successScans = recentScans.filter(s => s.status === 'success');
                      const headers = ['Roll Number', 'Full Name', 'Program', 'Branch', 'Year', 'Gender', 'Phone', 'Trial Session', 'Timestamp Scanned'];
                      const rows = successScans.map(s => [
                        `"${s.rollNumber || ''}"`,
                        `"${s.name || ''}"`,
                        `"${s.program || ''}"`,
                        `"${s.branch || ''}"`,
                        `"${s.year || ''}"`,
                        `"${s.gender || ''}"`,
                        `"${s.phone || ''}"`,
                        `"${s.trialTitle || ''}"`,
                        `"${s.timestamp || ''}"`
                      ]);
                      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', `scanned_attendance_${new Date().toISOString().slice(0, 10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="p-1 rounded-lg bg-[#121824] hover:bg-[#1a2334] border border-[#1E293B] text-[#B8FF3D] transition-colors cursor-pointer"
                    title="Export Scanned Attendance CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#0B0F17] border border-[#1E293B] max-h-[460px] overflow-y-auto space-y-2 no-scrollbar">
              {recentScans.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8B95A7] space-y-1">
                  <Clock className="w-6 h-6 mx-auto text-[#1E293B]" />
                  <p>No athlete scans recorded in this session yet.</p>
                  <p className="text-[11px] text-[#4B5565]">Scanned student ID cards will appear here in real time.</p>
                </div>
              ) : (
                recentScans.map((scan, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                      scan.status === 'success'
                        ? 'bg-[#121824] border-[#B8FF3D]/30 text-[#F5F7FA]'
                        : 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {scan.rollNumber && (
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#070A0F] text-[#B8FF3D] border border-[#B8FF3D]/30">
                            {scan.rollNumber}
                          </span>
                        )}
                        <span className="font-heading font-bold text-xs text-[#F5F7FA]">
                          {scan.name || (scan.status === 'success' ? 'Athlete Verified' : 'Scan Rejected')}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8B95A7] font-mono">
                        {scan.timestamp}
                      </span>
                    </div>

                    {scan.status === 'success' && (
                      <div className="text-[11px] text-[#8B95A7] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {scan.branch && (
                          <span>{scan.program || 'B.Tech'} • {scan.branch} {scan.year ? `(${scan.year} Yr)` : ''}</span>
                        )}
                        {scan.trialTitle && (
                          <span>• {scan.trialTitle}</span>
                        )}
                      </div>
                    )}

                    <div className={`text-[11px] leading-tight ${scan.status === 'success' ? 'text-emerald-400 font-medium' : 'text-[#FF6B6B]'}`}>
                      {scan.message}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
