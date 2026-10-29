'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { AIClassificationResult, WasteCategory, ComplaintPriority } from '@/lib/types';
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Layers,
  Flame,
  Check,
  Volume2,
  VolumeX,
  Crosshair,
  Radio,
  Locate,
  RefreshCw,
  Scan,
  Maximize2,
  X,
  ShieldCheck,
  User,
  Lock,
} from 'lucide-react';
import { WasteClassifierCard } from '@/components/ai/WasteClassifierCard';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/map/MapPicker').then((mod) => mod.MapPicker), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-400">
      Loading GPS Map...
    </div>
  ),
});

// Realistic pre-curated sample images for testing
const SAMPLE_WASTE_PHOTOS = [
  {
    name: 'Road Dust & Dumping',
    url: 'https://images.unsplash.com/photo-1599818816933-4f9d0c8d17b5?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Dry waste',
    defaultDesc: 'Heavy accumulation of road dust, sweeping debris, and roadside dumping.',
  },
  {
    name: 'Plastic Bottles',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Plastic waste',
    defaultDesc: 'Overflow of single-use plastic bottles, containers, and polythene.',
  },
  {
    name: 'Organic Food Waste',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Organic waste',
    defaultDesc: 'Perishable kitchen food scraps, vegetable residues, and wet organic waste.',
  },
  {
    name: 'Hazardous Chemicals',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Hazardous waste',
    defaultDesc: 'Corrosive chemical canisters, industrial paint residues, and hazardous substances.',
  },
  {
    name: 'E-Waste Electronics',
    url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'E-waste',
    defaultDesc: 'Discarded circuit boards, electronic cables, monitors, and battery components.',
  },
  {
    name: 'Broken Glass',
    url: 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=800&q=80',
    categoryHint: 'Glass waste',
    defaultDesc: 'Shattered beverage bottles, window fragments, and sharp glass shards.',
  },
];

export default function ReportWastePage() {
  const router = useRouter();
  const { currentUser, createReport, loginUser, switchUserRole } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Citizen Authentication state
  const [authEmail, setAuthEmail] = useState('citizen@urban.eco');
  const [authPassword, setAuthPassword] = useState('••••••••');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginUser(authEmail.trim());
    if (success) {
      setAuthError(null);
    } else {
      setAuthError('Account not found. Use "citizen@urban.eco" or click 1-Click Demo Login.');
    }
  };

  const handleQuickCitizenLogin = () => {
    switchUserRole('citizen');
    loginUser('citizen@urban.eco');
    setAuthError(null);
  };

  // Mode: Live Camera vs Photo Selected
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);

  // Form states
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_WASTE_PHOTOS[0].url);
  const [description, setDescription] = useState(
    SAMPLE_WASTE_PHOTOS[0].defaultDesc || 'Heavy accumulation of road dust, sweeping debris, and roadside dumping.'
  );
  const [quantity, setQuantity] = useState('Medium bin (5-20kg)');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');

  // GPS Coordinates (Default: Central Ward, Mumbai)
  const [latitude, setLatitude] = useState(19.076);
  const [longitude, setLongitude] = useState(72.8777);
  const [address, setAddress] = useState('42 MG Road, Central Ward, Mumbai');
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationTrackedSuccess, setLocationTrackedSuccess] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(6);
  const [capturedTimestamp, setCapturedTimestamp] = useState<string>('');

  // AI Classification states
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiModelSource, setAiModelSource] = useState<string | null>(null);

  // Voice Speech Synthesis states
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  // Initialize client timestamp safely
  useEffect(() => {
    setCapturedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    // Run initial analysis on default photo
    runAiClassification(SAMPLE_WASTE_PHOTOS[0].url);

    return () => {
      // Clean up camera on unmount
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Location Tracker: Track exact GPS when picture is taken or uploaded
  const trackCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }
    setIsTrackingLocation(true);
    setLocationTrackedSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy);

        setLatitude(lat);
        setLongitude(lng);
        setGpsAccuracy(accuracy);
        setIsTrackingLocation(false);
        setLocationTrackedSuccess(true);
        setCapturedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        // Reverse Geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: { 'Accept-Language': 'en' },
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              setAddress(data.display_name);
              return;
            }
          }
        } catch (e) {
          console.warn('Reverse geocode error:', e);
        }
        setAddress(`GPS Location: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E (±${accuracy}m)`);
      },
      (error) => {
        console.warn('Geolocation tracking notice:', error.message);
        setIsTrackingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Start Live Camera Viewfinder
  const startCamera = async () => {
    setCameraPermissionError(null);
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setIsCameraActive(false);
      setCameraPermissionError('Browser camera access was not granted. Using device photo picker instead.');
      fileInputRef.current?.click();
    }
  };

  // Stop Live Camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Shutter Click: Snap photo from live video feed
  const handleShutterClick = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setSelectedImage(dataUrl);
    stopCamera();

    // 1. Immediately track current GPS location
    trackCurrentLocation();

    // 2. Immediately send to AI vision model to tell what kind of waste it is
    runAiClassification('', dataUrl);
  };

  // Voice speech synthesis: Reads detected waste category aloud
  const speakWasteType = (category: string, stream: string, instructions?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const message = `Waste type detected: ${category}. Categorized as ${stream}. ${instructions || ''}`;
      setSpokenText(message);

      if (!voiceEnabled) return;

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis warning:', e);
    }
  };

  const handleReplayVoice = () => {
    if (!aiResult) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const message = `Waste type detected: ${aiResult.predicted_category}. Categorized as ${aiResult.wet_dry}. ${
      aiResult.disposal_instructions || ''
    }`;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Run AI Classification on the active image
  const runAiClassification = async (
    imageUrl: string,
    base64?: string,
    forceSimulation = false,
    categoryHint?: string,
    textDesc?: string,
    fileName?: string
  ) => {
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/classify-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          image_base64: base64,
          category_hint: categoryHint,
          description: textDesc || description,
          filename: fileName,
          allow_simulation: forceSimulation || true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requires_config) {
          setAiError(
            'Live AI API is not connected. Add GEMINI_API_KEY in .env.local to activate live Google Gemini Vision model.'
          );
        } else {
          setAiError(data.error || 'Failed to analyze waste image.');
        }
        return;
      }

      if (data.data) {
        setAiResult(data.data);
        setAiModelSource(data.model || 'Smart Waste Vision AI');

        // Website speaks aloud the detected waste type & instructions!
        speakWasteType(data.data.predicted_category, data.data.wet_dry, data.data.disposal_instructions);

        // Auto adjust priority if AI detects Hazardous or High severity
        if (data.data.hazard_level === 'High') {
          setPriority('Emergency');
        } else if (data.data.hazard_level === 'Moderate') {
          setPriority('High');
        }
      }
    } catch (e: any) {
      setAiError(e.message || 'Network error communicating with AI Vision model.');
    } finally {
      setAiLoading(false);
    }
  };

  // Handle manual category correction / confirmation
  const manuallySetCategory = (cat: WasteCategory) => {
    runAiClassification(selectedImage, selectedImage.startsWith('data:') ? selectedImage : undefined, true, cat, description);
  };

  // Handle file capture from phone camera or file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Immediately track location upon photo click/selection
    trackCurrentLocation();

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      setCapturedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      // 2. Classify waste type in picture with filename and current description
      runAiClassification('', base64, true, undefined, description, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Handle selecting a sample photo
  const handleSelectSample = (sample: (typeof SAMPLE_WASTE_PHOTOS)[0]) => {
    // Also trigger location tracking upon sample photo click
    trackCurrentLocation();
    setSelectedImage(sample.url);
    if (sample.defaultDesc) {
      setDescription(sample.defaultDesc);
    }
    setCapturedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    // Pass the sample's categoryHint and defaultDesc so AI classifies it accurately!
    runAiClassification(sample.url, undefined, true, sample.categoryHint, sample.defaultDesc);
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please enter your citizen credentials above to sign in before submitting a complaint.');
      return;
    }
    if (!selectedImage) {
      alert('Please take or upload a waste photograph.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a brief description of the waste pile.');
      return;
    }

    setIsSubmitting(true);

    const category = aiResult?.predicted_category || 'Mixed waste';

    const newReport = createReport({
      citizen_id: currentUser?.id || 'user-citizen-01',
      citizen_name: currentUser?.full_name || 'Citizen Aarav Sharma',
      citizen_phone: currentUser?.phone || '+91 98201 12345',
      description,
      quantity,
      image_url: selectedImage,
      latitude,
      longitude,
      address,
      predicted_category: category,
      verified_category: null,
      ai_confidence: aiResult?.confidence || 88,
      ai_details: aiResult || undefined,
      priority,
      status: 'Submitted',
    });

    setIsSubmitting(false);
    setSubmittedReportId(newReport.complaint_number);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            SMART CAMERA &amp; GPS TRACKER
          </span>
          <span className="text-xs text-slate-400">&bull; AI Waste Detection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Click Picture to Detect Waste &amp; Track Location
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Click a picture with your camera: your GPS location is automatically tracked, and the image HUD tells you
          instantly what kind of waste has been identified.
        </p>
      </div>

      {/* Verified Citizen Credential Badge */}
      {currentUser && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-emerald-950">
                Verified Citizen: {currentUser.full_name}
              </span>
              <span className="text-emerald-700 ml-1.5 text-[11px]">({currentUser.email})</span>
              <p className="text-[10px] text-emerald-600">
                Account Active &bull; Citizen ID: {currentUser.id} &bull; GPS Geotagging Ready
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Citizen Credentials Verified
          </span>
        </div>
      )}

      {/* GPS Tracking Notification Bar */}
      <div
        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isTrackingLocation
            ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
            : locationTrackedSuccess
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5 text-xs">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              isTrackingLocation
                ? 'bg-amber-500 text-white animate-spin'
                : locationTrackedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold">
                {isTrackingLocation
                  ? 'Satellite GPS Geolocation Tracking...'
                  : locationTrackedSuccess
                  ? 'GPS Location Tracked Automatically'
                  : 'Automated GPS Location Ready'}
              </span>
              {locationTrackedSuccess && (
                <span className="px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-mono font-bold">
                  &plusmn;{gpsAccuracy || 5}m Accuracy
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-80 mt-0.5 font-mono">
              Coordinates: {latitude.toFixed(5)}&deg; N, {longitude.toFixed(5)}&deg; E &bull; {address}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={trackCurrentLocation}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Locate className="w-3.5 h-3.5 text-emerald-600" />
          <span>Re-Track GPS</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Camera Photo Capture with Live HUD Overlay */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Camera Picture Viewfinder &amp; In-Image Classification</span>
            </h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Scan className="w-3.5 h-3.5" />
              Real-Time Vision HUD
            </span>
          </div>

          {/* Camera Error Alert if any */}
          {cameraPermissionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{cameraPermissionError}</span>
            </div>
          )}

          {/* PRIMARY VIEWFINDER BOX (Live Camera Stream OR Picture with In-Image Classification HUD) */}
          <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl group select-none">
            {isCameraActive ? (
              /* LIVE VIDEO VIEWFINDER STREAM */
              <div className="relative w-full h-full flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                {/* Tactical HUD Corner Brackets & Targeting Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  {/* Outer Frame Corner Accents */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                  {/* Top Live Rec Badge */}
                  <div className="absolute top-4 inset-x-0 flex items-center justify-between px-8">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      LIVE OPTICAL SENSOR ACTIVE
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950/80 text-cyan-300 font-mono text-[10px] border border-cyan-500/40">
                      GPS ACCURACY: ±{gpsAccuracy || 4}M
                    </span>
                  </div>

                  <div className="relative w-64 h-64 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    <Crosshair className="w-8 h-8 text-emerald-400 animate-pulse drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                    <span className="absolute -top-7 text-[10px] font-mono text-emerald-300 font-black bg-slate-950/90 px-3 py-1 rounded-full border border-emerald-400/60 shadow-lg">
                      POINT CAMERA AT WASTE PILE
                    </span>
                  </div>
                </div>

                {/* Shutter Button Overlay */}
                <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 shadow-xl cursor-pointer transition-all active:scale-95"
                    title="Cancel Camera"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleShutterClick}
                    className="flex items-center gap-2.5 px-7 py-4 rounded-full bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-2xl shadow-emerald-500/50 ring-4 ring-white/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-slate-950 fill-slate-950" />
                    <span>CLICK PICTURE &bull; DETECT &amp; TRACK GPS</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CAPTURED PICTURE WITH IN-IMAGE AI DETECTION HUD */
              <div className="relative w-full h-full">
                <img
                  src={selectedImage}
                  alt="Captured waste view"
                  className="w-full h-full object-cover transition-transform duration-500"
                />

                {/* Laser scan animation when AI is actively analyzing */}
                {aiLoading && (
                  <div className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 laser-scanner pointer-events-none" />
                )}

                {/* --- IN-PICTURE AI CLASSIFICATION HUD OVERLAY --- */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-black/80 p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
                  {/* TOP ROW: In-Picture Waste Type & Stream Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 max-w-sm">
                      {aiLoading ? (
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/95 border-2 border-cyan-400 text-cyan-300 font-mono text-xs font-black backdrop-blur-md shadow-xl shadow-cyan-950/80 animate-pulse">
                          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                          <span>AI SCANNING MATERIAL COMPOSITION...</span>
                        </div>
                      ) : aiResult ? (
                        <div className="space-y-1.5 animate-in fade-in zoom-in-95">
                          {/* Main In-Picture Detection Banner */}
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/95 border-2 border-emerald-400 text-white font-mono text-xs font-black backdrop-blur-md shadow-2xl shadow-emerald-950/90">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-emerald-400">DETECTED:</span>
                            <span className="tracking-wide text-white uppercase">{aiResult.predicted_category}</span>
                          </div>

                          {/* Secondary In-Picture Stream & Confidence Pills */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase backdrop-blur-sm shadow-md ${
                                aiResult.wet_dry === 'Wet waste'
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-cyan-500 text-slate-950'
                              }`}
                            >
                              {aiResult.wet_dry}
                            </span>

                            <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-mono font-black text-[10px] backdrop-blur-sm shadow-md">
                              {aiResult.confidence}% AI CONFIDENCE
                            </span>

                            <span className="px-2.5 py-1 rounded-md bg-black/80 text-slate-200 border border-white/20 font-mono text-[10px] font-bold">
                              Hazard: {aiResult.hazard_level}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-black/70 text-slate-300 font-mono text-xs backdrop-blur-xs border border-white/20">
                          Click Picture to Analyze Waste
                        </span>
                      )}
                    </div>

                    {/* Top Right: Voice Announcement Control */}
                    {aiResult && (
                      <button
                        type="button"
                        onClick={handleReplayVoice}
                        className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 text-white border border-emerald-400/60 backdrop-blur-md text-xs font-black shadow-xl transition-all active:scale-95 cursor-pointer"
                        title="Click to hear AI voice announce this waste type"
                      >
                        <Volume2 className={`w-4 h-4 text-emerald-400 ${isSpeaking ? 'animate-bounce' : ''}`} />
                        <span className="hidden sm:inline">Voice Replay</span>
                      </button>
                    )}
                  </div>

                  {/* CENTER: Bounding Reticle & Waste Tag over Picture */}
                  <div className="self-center flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 sm:w-60 sm:h-60 border-2 border-emerald-400/50 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                      {/* Corner Target Brackets with Neon Glow */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                      <Crosshair className="w-8 h-8 text-emerald-400/50" />

                      {/* Floating In-Picture Identification Tag */}
                      {aiResult && !aiLoading && (
                        <div className="absolute bottom-2.5 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-emerald-400 text-white text-[10px] font-mono font-black tracking-tight shadow-xl">
                          Target: {aiResult.predicted_category}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM ROW: Geolocation Stamp & Disposal Instructions on Picture */}
                  <div className="space-y-2">
                    {aiResult?.disposal_instructions && (
                      <div className="p-2.5 rounded-xl bg-slate-950/85 border border-slate-700/80 backdrop-blur-md text-[11px] text-slate-200 shadow-md">
                        <span className="text-emerald-400 font-black font-mono">DISPOSAL GUIDANCE: </span>
                        <span>{aiResult.disposal_instructions}</span>
                      </div>
                    )}

                    {/* Geotag Stamp Watermark */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono text-slate-300 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="font-black text-white">
                          GPS: {latitude.toFixed(5)}&deg; N, {longitude.toFixed(5)}&deg; E
                        </span>
                        <span>&bull; &plusmn;{gpsAccuracy || 4}m</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[200px] text-slate-300 font-medium">{address}</span>
                        <span>&bull; {capturedTimestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Android Mobile Camera + Live Shutter + Upload Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Launch Live Shutter Camera Button */}
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-5 py-3.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer hover:scale-[1.02]"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera &amp; Click Picture</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleShutterClick}
                className="flex-1 min-w-[180px] flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-black shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
                <span>Snap Picture &bull; Detect Waste &amp; Track GPS</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={() => runAiClassification(selectedImage, undefined, true)}
              disabled={aiLoading}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{aiLoading ? 'Analyzing...' : 'Re-Detect Waste'}</span>
            </button>
          </div>

          {/* Quick Realistic Sample Photos (Each tracks GPS & classifies in picture upon click) */}
          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <span>Quick Test Samples:</span>
              <span className="text-slate-400 font-normal lowercase">(auto-geotags &amp; classifies instantly)</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              {SAMPLE_WASTE_PHOTOS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-2xl border text-left transition-all cursor-pointer group hover:-translate-y-0.5 ${
                    selectedImage === sample.url
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/70 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                  }`}
                >
                  <img src={sample.url} alt={sample.name} className="w-full h-16 rounded-xl object-cover mb-1.5 group-hover:scale-105 transition-transform" />
                  <p className="text-[10px] font-bold text-slate-900 truncate">{sample.name}</p>
                  <span className="text-[9px] text-emerald-600 font-bold block">{sample.categoryHint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Voice Audio Announcement Bar & AI Deep Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>AI Classification Voice Output &amp; Municipal Advice</span>
            </h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Speech Synthesis Active
            </span>
          </div>

          {/* Voice Guidance Audio Bar with Equalizer Waveform */}
          {aiResult && (
            <div className="p-4 bg-linear-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg border border-emerald-600/40">
              <div className="flex items-center gap-3 truncate">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isSpeaking
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/30 animate-pulse'
                      : 'bg-white/10 text-emerald-300'
                  }`}
                >
                  <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
                </div>
                <div className="truncate text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">AI Spoken Announcement:</span>
                    {isSpeaking ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                          Speaking Output
                        </span>
                        {/* Audio equalizer visualization */}
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-emerald-400 rounded-full animate-bar-1" />
                          <span className="w-1 bg-emerald-400 rounded-full animate-bar-2" />
                          <span className="w-1 bg-emerald-400 rounded-full animate-bar-3" />
                          <span className="w-1 bg-emerald-400 rounded-full animate-bar-4" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-300 font-medium">Ready</span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-200/90 truncate font-mono mt-0.5">
                    &quot;{aiResult.predicted_category} &bull; {aiResult.wet_dry}&quot;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={handleReplayVoice}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Replay Voice Announcement"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Replay Voice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking && typeof window !== 'undefined') window.speechSynthesis?.cancel();
                    setVoiceEnabled(!voiceEnabled);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    voiceEnabled
                      ? 'bg-white/10 text-slate-200 hover:bg-white/20'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                  title={voiceEnabled ? 'Mute AI Speech' : 'Enable AI Speech'}
                >
                  {voiceEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Voice ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      <span>Muted</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <WasteClassifierCard
            result={aiResult}
            isLoading={aiLoading}
            error={aiError}
            modelSource={aiModelSource}
            onRunAnalysis={() => runAiClassification(selectedImage, undefined, true)}
          />

          {/* Quick Manual Category Override & Verification Bar */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify or Adjust Detected Waste Category:</span>
              </span>
              <span className="text-[10px] text-slate-400">Click to switch anytime</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { cat: 'Plastic waste', label: '🧴 Plastic' },
                { cat: 'Organic waste', label: '🍎 Organic' },
                { cat: 'Dry waste', label: '🧹 Dry / Dust' },
                { cat: 'Paper waste', label: '📦 Paper' },
                { cat: 'Glass waste', label: '🍾 Glass' },
                { cat: 'Metal waste', label: '🥫 Metal' },
                { cat: 'E-waste', label: '💻 E-Waste' },
                { cat: 'Hazardous waste', label: '⚠️ Hazardous' },
                { cat: 'Wet waste', label: '🥗 Wet Waste' },
                { cat: 'Mixed waste', label: '🗑️ Mixed' },
              ].map((item) => {
                const isSelected = aiResult?.predicted_category === item.cat;
                return (
                  <button
                    key={item.cat}
                    type="button"
                    onClick={() => manuallySetCategory(item.cat as WasteCategory)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-500/30 scale-105'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: GPS Coordinates & Interactive Map (Auto-Updated when picture is clicked) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>GPS Location &amp; Map Pin (Auto-Tracked with Picture)</span>
            </h3>
            <span className="text-xs text-slate-400">Draggable Pin Support</span>
          </div>

          <MapPicker
            latitude={latitude}
            longitude={longitude}
            address={address}
            onLocationChange={(newLat, newLng, newAddress) => {
              setLatitude(newLat);
              setLongitude(newLng);
              setAddress(newAddress);
            }}
          />
        </div>

        {/* Step 4: Description, Quantity & Urgency */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
              4
            </span>
            <span>Complaint Description &amp; Estimated Quantity</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Description of Dump / Waste Condition *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. Large pile of discarded plastic packaging and food wrappers blocking the sidewalk near the corner tea stall..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Estimated Waste Quantity</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  <option value="Small bag (<5kg)">Small bag (&lt;5kg)</option>
                  <option value="Medium bin (5-20kg)">Medium bin (5-20kg)</option>
                  <option value="Large dump (20-100kg)">Large dump (20-100kg)</option>
                  <option value="Massive pile (>100kg)">Massive pile (&gt;100kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Complaint Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  <option value="Low">Low - Normal Routine Collection</option>
                  <option value="Medium">Medium - Regular Priority</option>
                  <option value="High">High - Impeding Pedestrians / Odor</option>
                  <option value="Emergency">Emergency - Biohazard / Toxic Danger</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? 'Submitting to Municipal Control...' : 'Submit Waste Complaint'}</span>
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {submittedReportId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-widest">
                Complaint Registered
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Dispatched to Municipal Control</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your report has been logged with complaint reference:
              </p>
              <div className="font-mono text-sm font-black text-emerald-700 mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                {submittedReportId}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Waste Detected:</span>
                <span className="font-bold text-slate-800">{aiResult?.predicted_category || 'Mixed waste'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Waste Stream:</span>
                <span className="font-bold text-emerald-700">{aiResult?.wet_dry || 'Dry Recyclable'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tracked GPS:</span>
                <span className="font-mono text-slate-700 font-medium">
                  {latitude.toFixed(4)}&deg; N, {longitude.toFixed(4)}&deg; E
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Nearest Worker Dispatch Notification</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your road dumping complaint and GPS coordinates have been delivered to the Admin Command Center. The admin will assign the nearest available sanitation squad to clear this location.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/citizen/track?id=${submittedReportId}`)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Track Complaint Progress Timeline
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedReportId(null);
                  setDescription('');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                File Another Waste Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
