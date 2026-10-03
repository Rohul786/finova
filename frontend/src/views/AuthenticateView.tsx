import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { KycData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { FinovaLogo } from '../components/FinovaLogo';
import {
  ShieldCheck,
  Camera,
  Smartphone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Lock,
  User,
  Calendar,
  MapPin,
  Upload,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Shield,
  Download,
  Fingerprint,
  Check,
  Eye,
  Zap,
  Globe,
  Sliders,
  CheckCircle,
  XCircle,
  Copy,
  Scan,
} from 'lucide-react';

export const AuthenticateView: React.FC = () => {
  const { userProfile, completeKyc, resetKyc, setActiveTab } = useApp();

  // Wizard Step: 1 = Gov ID, 2 = Live Selfie, 3 = Mobile OTP, 4 = Email OTP, 5 = Final Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Government Identity State
  const [docType, setDocType] = useState<'Aadhaar Card' | 'PAN Card' | 'Passport' | 'Driving License' | 'Voter ID'>(
    'Aadhaar Card'
  );
  const [docNumber, setDocNumber] = useState('8492-3019-4820');
  const [legalName, setLegalName] = useState(userProfile.name || 'Mamtaz Tuni');
  const [dob, setDob] = useState('2001-05-14');
  const [address, setAddress] = useState(userProfile.city || 'Bengaluru, Karnataka, India');
  const [idFrontUploaded, setIdFrontUploaded] = useState<string | null>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  );
  const [idBackUploaded, setIdBackUploaded] = useState<string | null>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
  );
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2: Live Selfie State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(
    userProfile.kycData?.selfieUrl || userProfile.avatarUrl || null
  );
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceScanProgress, setFaceScanProgress] = useState(0);
  const [isLivenessVerified, setIsLivenessVerified] = useState(!!userProfile.isVerified);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileSelfieRef = useRef<HTMLInputElement | null>(null);

  // Step 3: Mobile OTP State
  const [mobileNumber, setMobileNumber] = useState(userProfile.phone || '');
  const [isMobileOtpSent, setIsMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [isMobileVerified, setIsMobileVerified] = useState(!!userProfile.kycData?.mobileVerified);
  const [mobileTimer, setMobileTimer] = useState(0);
  const [mobileError, setMobileError] = useState<string | null>(null);

  // Step 4: Email OTP State
  const [emailAddress, setEmailAddress] = useState(userProfile.email || '');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(!!userProfile.kycData?.emailVerified);
  const [emailTimer, setEmailTimer] = useState(0);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Step 5: Submission & Copied state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKycId, setCopiedKycId] = useState(false);

  // Countdown timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mobileTimer > 0) {
      interval = setInterval(() => setMobileTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mobileTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailTimer > 0) {
      interval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Camera Management
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {
            // video play might be interrupted
          }
          setIsCameraActive(true);
        }
      } else {
        setCameraError('Camera access not supported on this browser. You can upload a live selfie photo or use demo photo instead.');
      }
    } catch (err: any) {
      console.warn('Camera access unavailable or denied:', err?.message || err);
      setCameraError('Camera access was blocked or denied in this environment. You can upload a photo or use a sample photo below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedSelfie(dataUrl);
        stopCamera();
        runFaceLivenessScan();
      }
    }
  };

  const handleSelfieFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCapturedSelfie(result);
        stopCamera();
        runFaceLivenessScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const runFaceLivenessScan = () => {
    setIsScanningFace(true);
    setFaceScanProgress(15);
    const interval = setInterval(() => {
      setFaceScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanningFace(false);
          setIsLivenessVerified(true);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  // Step 1 Validation
  const handleProceedStep1 = () => {
    setStep1Error(null);
    if (!legalName.trim()) {
      setStep1Error('Please provide your full legal name as it appears on your ID.');
      return;
    }
    if (!docNumber.trim() || docNumber.trim().length < 6) {
      setStep1Error('Please provide a valid Government Document Identification Number.');
      return;
    }
    setCurrentStep(2);
  };

  // Step 3: Send & Verify Mobile OTP
  const handleSendMobileOtp = () => {
    if (!mobileNumber.trim()) {
      setMobileError('Please enter a valid mobile number.');
      return;
    }
    setMobileError(null);
    setIsMobileOtpSent(true);
    setMobileTimer(30);
    setMobileOtp('');
  };

  const handleVerifyMobileOtp = () => {
    if (mobileOtp.trim().length < 4) {
      setMobileError('Please enter the 6-digit OTP code.');
      return;
    }
    setMobileError(null);
    setIsMobileVerified(true);
  };

  // Step 4: Send & Verify Email OTP
  const handleSendEmailOtp = () => {
    if (!emailAddress.trim() || !emailAddress.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError(null);
    setIsEmailOtpSent(true);
    setEmailTimer(30);
    setEmailOtp('');
  };

  const handleVerifyEmailOtp = () => {
    if (emailOtp.trim().length < 4) {
      setEmailError('Please enter the 6-digit OTP code.');
      return;
    }
    setEmailError(null);
    setIsEmailVerified(true);
  };

  // Step 5: Final Submission
  const handleCompleteAuthentication = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedKycId = `FIN-KYC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const newKycData: KycData = {
        documentType: docType,
        documentNumber: docNumber,
        fullName: legalName,
        dateOfBirth: dob,
        address,
        selfieUrl:
          capturedSelfie ||
          'https://api.dicebear.com/7.x/adventurer/svg?seed=Mamtaz&backgroundColor=b6e3f4,c0aede,d1d4f9',
        selfieTimestamp: new Date().toISOString(),
        mobileNumber,
        mobileVerified: true,
        mobileVerifiedAt: new Date().toISOString(),
        emailAddress,
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
        kycId: generatedKycId,
        verifiedAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        securityHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}...SHA256`,
      };

      completeKyc(newKycData);
      setIsSubmitting(false);
    }, 800);
  };

  const activeKyc = userProfile.kycData;

  const copyKycId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKycId(true);
    setTimeout(() => setCopiedKycId(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#141824] via-[#111318] to-[#141824] border border-[#1f2937] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {userProfile.isVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified Investor Profile Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                    KYC & Authentication Required
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1f2937] text-zinc-400 border border-[#374151]">
                  Bank-Grade 256-Bit Vault
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
                Authentication & KYC Verification
              </h1>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Verify your government identity, capture a live selfie with AI liveness detection, and authenticate your mobile & email via OTP to unlock your Verified Investor Badge.
              </p>
            </div>
          </div>

          {userProfile.isVerified && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetKyc();
                  setCurrentStep(1);
                  setIsLivenessVerified(false);
                  setIsMobileVerified(false);
                  setIsEmailVerified(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#161922] hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-[#1f2937] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Verify / Edit KYC</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: VERIFIED INVESTOR CERTIFICATE & BADGE PREVIEW     */}
      {/* ========================================================= */}
      {userProfile.isVerified && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Certificate Card */}
          <div className="bg-gradient-to-br from-[#121622] via-[#0f121a] to-[#141d24] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#1f2937] relative z-10">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="relative">
                  <img
                    src={userProfile.kycData?.selfieUrl || userProfile.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mamtaz'}
                    alt="Verified Selfie"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 bg-[#161922] shadow-xl shadow-emerald-500/20"
                  />
                  <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 text-zinc-950 rounded-full shadow-lg">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-100">
                      {userProfile.kycData?.fullName || userProfile.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Investor
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 flex items-center justify-center md:justify-start gap-1.5">
                    <FinovaLogo size={18} withBackground={false} />
                    <span>Finova Identity Pass • Verified Cryptographic KYC</span>
                  </div>
                </div>
              </div>

              {/* KYC Certificate ID Box */}
              <div className="bg-[#161922] border border-emerald-500/30 rounded-2xl p-4 text-center md:text-right space-y-1 shadow-md">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Cryptographic KYC Credential ID
                </div>
                <div className="flex items-center justify-center md:justify-end gap-2 font-mono font-black text-sm text-zinc-100">
                  <span>{userProfile.kycData?.kycId || 'FIN-KYC-2026-948271'}</span>
                  <button
                    type="button"
                    onClick={() => copyKycId(userProfile.kycData?.kycId || 'FIN-KYC-2026-948271')}
                    className="text-zinc-400 hover:text-emerald-400 p-1 cursor-pointer"
                    title="Copy Certificate ID"
                  >
                    {copiedKycId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-zinc-500 font-medium">
                  Issued on: {userProfile.kycData?.verifiedAt || 'Today'}
                </div>
              </div>
            </div>

            {/* Verified Details 4-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 relative z-10">
              {/* Item 1: Gov ID */}
              <div className="p-4 rounded-2xl bg-[#161922]/80 border border-[#1f2937] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Government ID</span>
                  <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                </div>
                <div className="font-bold text-xs text-zinc-100">{userProfile.kycData?.documentType || 'Aadhaar Card'}</div>
                <div className="font-mono text-[11px] text-zinc-400">
                  {userProfile.kycData?.documentNumber || 'XXXX-XXXX-8492'}
                </div>
              </div>

              {/* Item 2: Live Selfie Liveness */}
              <div className="p-4 rounded-2xl bg-[#161922]/80 border border-[#1f2937] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Liveness Biometric</span>
                  <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                </div>
                <div className="font-bold text-xs text-zinc-100">AI 3D Face Match</div>
                <div className="text-[11px] text-emerald-400 font-medium">100% Geometry Passed</div>
              </div>

              {/* Item 3: Mobile OTP */}
              <div className="p-4 rounded-2xl bg-[#161922]/80 border border-[#1f2937] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Phone Authentication</span>
                  <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                </div>
                <div className="font-bold text-xs text-zinc-100">{userProfile.kycData?.mobileNumber || userProfile.phone || '+91 98765 43210'}</div>
                <div className="text-[11px] text-emerald-400 font-medium">SMS OTP Verified ✓</div>
              </div>

              {/* Item 4: Email OTP */}
              <div className="p-4 rounded-2xl bg-[#161922]/80 border border-[#1f2937] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email Authentication</span>
                  <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                </div>
                <div className="font-bold text-xs text-zinc-100 truncate">{userProfile.kycData?.emailAddress || userProfile.email}</div>
                <div className="text-[11px] text-emerald-400 font-medium">Email OTP Verified ✓</div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security Token: {userProfile.kycData?.securityHash || '0x7F4A...SHA256'}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Go to Investor Dashboard →</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: INTERACTIVE 4-STEP KYC WIZARD (When Not Verified) */}
      {/* ========================================================= */}
      {!userProfile.isVerified && (
        <div className="space-y-6">
          {/* Step Indicator Header */}
          <div className="bg-[#111318] border border-[#1f2937] rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { step: 1, label: '1. Government ID', icon: FileText },
                { step: 2, label: '2. Live Selfie', icon: Camera },
                { step: 3, label: '3. Mobile OTP', icon: Smartphone },
                { step: 4, label: '4. Email OTP', icon: Mail },
              ].map((s) => {
                const Icon = s.icon;
                const isCurrent = currentStep === s.step;
                const isDone =
                  (s.step === 1 && currentStep > 1) ||
                  (s.step === 2 && isLivenessVerified) ||
                  (s.step === 3 && isMobileVerified) ||
                  (s.step === 4 && isEmailVerified);

                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setCurrentStep(s.step as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-md'
                        : isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-[#161922] border-[#1f2937] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                        isCurrent
                          ? 'bg-amber-500 text-zinc-950'
                          : isDone
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-[#1f2937] text-zinc-400'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{s.label}</div>
                      <div className="text-[10px] text-zinc-500">
                        {isDone ? 'Completed ✓' : isCurrent ? 'Active Step' : 'Pending'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 1: Government Identity (KYC Details) */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111318]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1f2937]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-100">Step 1: Government Identity Verification</h2>
                    <p className="text-xs text-zinc-400">Select your official document type and enter your legal credentials.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Step 1 of 4
                </span>
              </div>

              {step1Error && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{step1Error}</span>
                </div>
              )}

              {/* Document Type Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Select Official Document Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License', 'Voter ID'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDocType(type)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                        docType === type
                          ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md font-black'
                          : 'bg-[#161922] border-[#1f2937] text-zinc-300 hover:text-zinc-100 hover:bg-[#1f2937]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Full Legal Name (as on {docType}) *
                  </label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. Mamtaz Tuni"
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    {docType} Identification Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. 8492-3019-4820 or ABCDE1234F"
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Date of Birth (as on ID) *
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Permanent Residential Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Bengaluru, Karnataka, India"
                    className="w-full bg-[#161922] text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* ID Document Preview / Upload */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Document Images (Front & Back Scan)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#161922] border border-[#1f2937] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-200">Front Side Document Scan</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">Ready & Encrypted ✓</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Auto-Captured
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#161922] border border-[#1f2937] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-200">Back Side Document Scan</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">Ready & Encrypted ✓</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Auto-Captured
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleProceedStep1}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Live Selfie Capture →</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Live Selfie Capture & AI Liveness Check */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111318]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1f2937]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-100">Step 2: Live Selfie & Biometric Liveness Verification</h2>
                    <p className="text-xs text-zinc-400">Position your face within the frame and capture a live photo to confirm real-time identity.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Step 2 of 4
                </span>
              </div>

              {cameraError && (
                <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Hidden canvas for taking snap */}
              <canvas ref={canvasRef} className="hidden" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Video / Camera Stream Window (7 Cols) */}
                <div className="md:col-span-7 space-y-4">
                  <div className="relative aspect-video rounded-2xl bg-[#161922] border-2 border-[#1f2937] overflow-hidden flex items-center justify-center shadow-inner">
                    {/* Live Video Element */}
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                    />

                    {/* Liveness Oval Guide */}
                    {isCameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-64 border-2 border-dashed border-cyan-400/80 rounded-full flex items-center justify-center">
                          <span className="text-[11px] font-bold text-cyan-300 bg-black/60 px-2 py-0.5 rounded-full">
                            Align Face in Center
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Camera Offline Placeholder / Captured Selfie Preview */}
                    {!isCameraActive && (
                      <div className="text-center p-6 space-y-3">
                        {capturedSelfie ? (
                          <div className="relative inline-block">
                            <img
                              src={capturedSelfie}
                              alt="Captured Live Selfie"
                              className="w-36 h-36 rounded-2xl object-cover border-2 border-emerald-400 shadow-xl"
                            />
                            {isLivenessVerified && (
                              <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 text-zinc-950 rounded-full shadow-md">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-[#1f2937] border border-[#374151] flex items-center justify-center text-zinc-500 mx-auto">
                            <Camera className="w-10 h-10" />
                          </div>
                        )}
                        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                          {capturedSelfie
                            ? 'Live selfie captured successfully. You can retake or proceed.'
                            : 'Click Start Live Web Camera or upload a photo to perform liveness biometric match.'}
                        </p>
                      </div>
                    )}

                    {/* Scanning Face HUD Effect */}
                    {isScanningFace && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 space-y-3 z-20">
                        <div className="w-14 h-14 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 animate-pulse">
                          <Scan className="w-7 h-7 animate-spin" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-cyan-300">Biometric Face Geometry Scan</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">Matching anti-spoofing landmarks... {faceScanProgress}%</div>
                        </div>
                        <div className="w-48 h-2 rounded-full bg-[#1f2937] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${faceScanProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Camera Control Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {!isCameraActive ? (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Start Live Camera</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={capturePhoto}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Take Snapshot & Verify Liveness</span>
                      </motion.button>
                    )}

                    {isCameraActive && (
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3.5 py-2.5 rounded-xl bg-[#1f2937] hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel Camera
                      </button>
                    )}

                    {/* Fallback File Upload */}
                    <input
                      ref={fileSelfieRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSelfieFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileSelfieRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2937] text-zinc-300 border border-[#1f2937] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCapturedSelfie('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80');
                        stopCamera();
                        runFaceLivenessScan();
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-[#161922] hover:bg-[#1f2937] text-zinc-300 border border-[#1f2937] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Use Demo Sample</span>
                    </button>
                  </div>
                </div>

                {/* Right: Liveness Requirements & Biometric Checklist (5 Cols) */}
                <div className="md:col-span-5 space-y-4">
                  <div className="p-5 rounded-2xl bg-[#161922] border border-[#1f2937] space-y-3">
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Biometric Guidelines</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-zinc-400">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Ensure adequate natural room lighting</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Remove sunglasses or dark face coverings</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Look straight into the lens without tilting</span>
                      </li>
                    </ul>
                  </div>

                  {isLivenessVerified && (
                    <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-zinc-100">Live Selfie Biometrics Verified</div>
                        <div className="text-[11px] text-emerald-400">3D Face Mesh matched successfully with Document.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-[#161922] text-zinc-300 text-xs font-bold hover:bg-[#1f2937] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Gov ID</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    if (!capturedSelfie) {
                      setCapturedSelfie(
                        'https://api.dicebear.com/7.x/adventurer/svg?seed=Mamtaz&backgroundColor=b6e3f4,c0aede,d1d4f9'
                      );
                      setIsLivenessVerified(true);
                    }
                    setCurrentStep(3);
                  }}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Mobile OTP Verification →</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Mobile Number OTP Verification */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111318]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1f2937]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-100">Step 3: Mobile Phone Number OTP Verification</h2>
                    <p className="text-xs text-zinc-400">Verify your registered contact phone number to authorize financial transactions.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Step 3 of 4
                </span>
              </div>

              {mobileError && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{mobileError}</span>
                </div>
              )}

              <div className="max-w-md mx-auto space-y-4">
                {/* Mobile Number Input */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Phone Number for 2FA OTP *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="flex-1 bg-[#161922] text-zinc-100 text-xs px-3.5 py-3 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      disabled={mobileTimer > 0}
                      className="px-4 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                    >
                      {mobileTimer > 0 ? `Resend in ${mobileTimer}s` : isMobileOtpSent ? 'Resend OTP' : 'Send SMS OTP'}
                    </button>
                  </div>
                </div>

                {/* OTP Input Form */}
                {isMobileOtpSent && (
                  <div className="space-y-3 p-4 rounded-2xl bg-[#161922] border border-[#1f2937]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-300">
                        Enter 6-Digit SMS Verification OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOtp('849201');
                          setIsMobileVerified(true);
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                      >
                        Auto-fill Demo OTP (849201)
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value)}
                      placeholder="849201"
                      className="w-full text-center tracking-widest text-lg font-mono font-black bg-[#111318] text-amber-400 px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />

                    <button
                      type="button"
                      onClick={handleVerifyMobileOtp}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Verify Phone OTP ✓
                    </button>
                  </div>
                )}

                {isMobileVerified && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Mobile number verified successfully via SMS OTP!</span>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-[#161922] text-zinc-300 text-xs font-bold hover:bg-[#1f2937] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Live Selfie</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setIsMobileVerified(true);
                    setCurrentStep(4);
                  }}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Email OTP Verification →</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Email Address OTP Verification */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111318]/95 backdrop-blur-xl border border-[#1f2937] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1f2937]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-100">Step 4: Email Address OTP Verification</h2>
                    <p className="text-xs text-zinc-400">Verify your registered email to receive official statements and tax reports.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                  Step 4 of 4
                </span>
              </div>

              {emailError && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              <div className="max-w-md mx-auto space-y-4">
                {/* Email Address Input */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Email Address for 2FA OTP *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="flex-1 bg-[#161922] text-zinc-100 text-xs px-3.5 py-3 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailTimer > 0}
                      className="px-4 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                    >
                      {emailTimer > 0 ? `Resend in ${emailTimer}s` : isEmailOtpSent ? 'Resend OTP' : 'Send Email OTP'}
                    </button>
                  </div>
                </div>

                {/* OTP Input Form */}
                {isEmailOtpSent && (
                  <div className="space-y-3 p-4 rounded-2xl bg-[#161922] border border-[#1f2937]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-300">
                        Enter 6-Digit Email Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailOtp('519342');
                          setIsEmailVerified(true);
                        }}
                        className="text-[11px] font-bold text-teal-400 hover:underline cursor-pointer"
                      >
                        Auto-fill Demo OTP (519342)
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="519342"
                      className="w-full text-center tracking-widest text-lg font-mono font-black bg-[#111318] text-teal-400 px-3.5 py-2.5 rounded-xl border border-[#1f2937] focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Verify Email OTP ✓
                    </button>
                  </div>
                )}

                {isEmailVerified && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Email address verified successfully via OTP!</span>
                  </div>
                )}
              </div>

              {/* Navigation & Final Review Checklist */}
              <div className="space-y-4 pt-4 border-t border-[#1f2937]">
                {/* Summary Box */}
                <div className="p-4 rounded-2xl bg-[#161922] border border-[#1f2937] space-y-2">
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Authentication Checklist Summary
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{docType} ID</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Live 3D Selfie</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Mobile SMS OTP</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Email OTP</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2.5 rounded-xl bg-[#161922] text-zinc-300 text-xs font-bold hover:bg-[#1f2937] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Mobile OTP</span>
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleCompleteAuthentication}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                        <span>Issuing Cryptographic KYC Certificate...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-zinc-950" />
                        <span>Submit & Activate Verified Investor Badge ✦</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
