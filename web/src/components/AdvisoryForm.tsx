'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { AIAdvisoryResponse } from '@/types/advisory';
import AdvisoryResult from './AdvisoryResult';
import LoadingSpinner from './LoadingSpinner';
import ErrorBanner from './ErrorBanner';

const CROPS = [
  'Wheat', 'Rice', 'Tomato', 'Cotton', 'Sugarcane',
  'Mustard', 'Soybean', 'Maize', 'Chili', 'Potato',
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

type Status = 'idle' | 'locating' | 'loading' | 'success' | 'error';

interface LocationState {
  lat: number | null;
  lng: number | null;
  label: string;
  manualMode: boolean;
}

function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) return 'Network error. Please check your connection and try again.';
    if (msg.includes('400')) return 'The request was invalid. Please check your inputs and try again.';
    if (msg.includes('500') || msg.includes('server')) return 'The analysis service encountered an error. Please try again in a moment.';
  }
  return 'Something went wrong. Please try again.';
}

/* ── Step indicator ─────────────────────────────────────────────── */
const STEPS = [
  { n: 1, label: 'Location' },
  { n: 2, label: 'Crop' },
  { n: 3, label: 'Photo' },
  { n: 4, label: 'Analyze' },
] as const;

function StepBar({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <nav aria-label="Progress steps" className="flex items-center justify-between mb-6">
      {STEPS.map((step, i) => {
        const done = step.n < current;
        const active = step.n === current;
        return (
          <div key={step.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${done ? 'bg-green-600 text-white' : active ? 'bg-green-600 text-white ring-4 ring-green-100' : 'bg-gray-100 text-gray-400'}`}
                aria-current={active ? 'step' : undefined}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.n}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide uppercase hidden sm:block
                ${done || active ? 'text-green-700' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${done ? 'bg-green-500' : 'bg-gray-200'}`} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ── Section card wrapper ────────────────────────────────────────── */
function StepCard({
  stepNum,
  title,
  subtitle,
  children,
}: {
  stepNum: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <span
          className="w-7 h-7 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold shrink-0"
          aria-hidden="true"
        >
          {stepNum}
        </span>
        <div>
          <legend className="text-sm font-bold text-gray-800 leading-tight">{title}</legend>
          {subtitle && <p className="text-xs text-gray-400 leading-tight mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </fieldset>
  );
}

/* ── Icon helpers ────────────────────────────────────────────────── */
function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ── Main form ───────────────────────────────────────────────────── */
export default function AdvisoryForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [advisory, setAdvisory] = useState<AIAdvisoryResponse | null>(null);

  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    label: '',
    manualMode: false,
  });
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const [crop, setCrop] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [cropError, setCropError] = useState('');


  // Revoke object URL on cleanup
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Scroll to result on success
  useEffect(() => {
    if (status === 'success' && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      setLocation(prev => ({ ...prev, manualMode: true }));
      return;
    }
    setStatus('locating');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: `${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`,
          manualMode: false,
        });
        setStatus('idle');
      },
      (err) => {
        setStatus('idle');
        let msg = 'Could not get your location.';
        if (err.code === 1) msg = 'Location permission was denied. Please enter coordinates manually.';
        else if (err.code === 2) msg = 'Location unavailable. Please enter coordinates manually.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again or enter manually.';
        setLocationError(msg);
        setLocation(prev => ({ ...prev, manualMode: true }));
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  const handleManualLocation = useCallback(() => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setLocationError('Please enter a valid latitude between -90 and 90.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setLocationError('Please enter a valid longitude between -180 and 180.');
      return;
    }
    setLocationError('');
    setLocation({
      lat,
      lng,
      label: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
      manualMode: false,
    });
  }, [manualLat, manualLng]);

  const handleImageChange = useCallback((file: File | null) => {
    setImageError('');
    if (!file) {
      setImageFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError('Only JPEG and PNG images are supported.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setImageError('Image must be smaller than 10 MB.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, [previewUrl]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e.target.files?.[0] ?? null);
  }, [handleImageChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleImageChange(e.dataTransfer.files?.[0] ?? null);
  }, [handleImageChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleRemoveImage = useCallback(() => {
    handleImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleImageChange]);

  const handleRetry = useCallback(() => {
    setStatus('idle');
    setErrorMsg('');
  }, []);

  const validate = useCallback((): boolean => {
    let valid = true;
    if (!imageFile) { setImageError('Please select a crop image.'); valid = false; }
    if (!crop) { setCropError('Please select a crop.'); valid = false; }
    if (location.lat === null || location.lng === null) {
      setLocationError('Please provide your location before analyzing.'); valid = false;
    }
    return valid;
  }, [imageFile, crop, location]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setImageError('');
    setCropError('');
    setLocationError('');
    if (!validate()) return;

    setStatus('loading');
    setAdvisory(null);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile!);
      formData.append('lat', String(location.lat));
      formData.append('lng', String(location.lng));
      formData.append('crop', crop);

      const res = await fetch('/api/advisory', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(`HTTP ${res.status}`);
      }
      setAdvisory(data.advisory as AIAdvisoryResponse);
      setStatus('success');
    } catch (err) {
      setErrorMsg(friendlyError(err));
      setStatus('error');
    }
  }, [validate, imageFile, location, crop]);

  const isSubmitting = status === 'loading' || status === 'locating';

  /* Derive current step for the progress bar */
  const currentStep: 1 | 2 | 3 | 4 =
    location.lat === null ? 1
    : !crop ? 2
    : !imageFile ? 3
    : 4;

  return (
    <div className="space-y-4">
      {/* Step progress */}
      <StepBar current={currentStep} />

      <form onSubmit={handleSubmit} noValidate className="space-y-3">

        {/* ── Step 1: Location ─────────────────────────────── */}
        <StepCard
          stepNum={1}
          title="Your Location"
          subtitle="Used for regional weather and agricultural context"
        >
          {location.lat !== null && !location.manualMode ? (
            /* Location confirmed */
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <PinIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Location set</p>
                  <p className="text-sm text-green-900 font-semibold">{location.label}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLocation({ lat: null, lng: null, label: '', manualMode: false })}
                className="text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                aria-label="Change location"
              >
                Change
              </button>
            </div>
          ) : location.manualMode ? (
            /* Manual entry */
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Enter decimal degree coordinates (e.g. Ludhiana: 30.9009, 75.8572)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="manual-lat" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Latitude
                  </label>
                  <input
                    id="manual-lat"
                    type="number"
                    step="any"
                    placeholder="e.g. 30.9009"
                    value={manualLat}
                    onChange={e => setManualLat(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    aria-describedby="location-error"
                  />
                </div>
                <div>
                  <label htmlFor="manual-lng" className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Longitude
                  </label>
                  <input
                    id="manual-lng"
                    type="number"
                    step="any"
                    placeholder="e.g. 75.8572"
                    value={manualLng}
                    onChange={e => setManualLng(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    aria-describedby="location-error"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleManualLocation}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  Set Location
                </button>
                <button
                  type="button"
                  onClick={() => setLocation(prev => ({ ...prev, manualMode: false }))}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Default: GPS or manual choice */
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={status === 'locating'}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                aria-label="Use current GPS location"
              >
                {status === 'locating' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    Getting location…
                  </>
                ) : (
                  <>
                    <PinIcon className="w-4 h-4" />
                    Use My Current Location
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setLocation(prev => ({ ...prev, manualMode: true }))}
                className="w-full text-xs font-semibold text-gray-500 hover:text-gray-700 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
              >
                Enter coordinates manually →
              </button>
            </div>
          )}

          {locationError && (
            <div id="location-error" role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{locationError}</p>
            </div>
          )}
        </StepCard>

        {/* ── Step 2: Crop ─────────────────────────────────── */}
        <StepCard
          stepNum={2}
          title="Select Crop"
          subtitle="Choose the crop shown in your photo"
        >
          <label htmlFor="crop-select" className="sr-only">Select crop type</label>
          <div className="relative">
            <select
              id="crop-select"
              value={crop}
              onChange={e => { setCrop(e.target.value); setCropError(''); }}
              className={`w-full rounded-xl border px-4 py-3 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer
                ${cropError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              aria-describedby={cropError ? 'crop-error' : undefined}
              aria-required="true"
            >
              <option value="">Choose a crop…</option>
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* Custom chevron */}
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Crop chip grid for quick selection */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {CROPS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { setCrop(c); setCropError(''); }}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
                  ${crop === c
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
                  }`}
                aria-pressed={crop === c}
              >
                {c}
              </button>
            ))}
          </div>

          {cropError && (
            <p id="crop-error" role="alert" className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {cropError}
            </p>
          )}
        </StepCard>

        {/* ── Step 3: Image ────────────────────────────────── */}
        <StepCard
          stepNum={3}
          title="Crop Photo"
          subtitle="Clear, well-lit photo of the affected area gives better results"
        >
          {previewUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview of uploaded crop"
                  className="w-full object-cover max-h-56"
                />

                {/* Overlay filename */}
                {imageFile && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-3 py-1.5 truncate">
                    {imageFile.name} · {(imageFile.size / 1024).toFixed(0)} KB
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  aria-label="Remove selected photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              aria-label="Upload crop photo. Click or drag and drop a JPEG or PNG image."
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
                ${imageError ? 'border-red-400 bg-red-50'
                  : dragActive ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'}`}
            >
              <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center transition-colors
                ${dragActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                <svg className={`w-7 h-7 transition-colors ${dragActive ? 'text-green-600' : 'text-gray-400'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-700">
                {dragActive ? 'Drop photo here' : 'Tap to take or upload a photo'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Drag &amp; drop, click to browse, or use camera
              </p>
              <p className="text-xs text-gray-400 mt-0.5">JPEG or PNG · max 10 MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            id="crop-image"
            type="file"
            accept="image/jpeg,image/png"
            capture="environment"
            onChange={handleFileInputChange}
            className="sr-only"
            aria-label="Upload crop image file"
            aria-describedby={imageError ? 'image-error' : undefined}
          />

          {imageError && (
            <div id="image-error" role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{imageError}</p>
            </div>
          )}
        </StepCard>

        {/* ── Analyze button ───────────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed
            text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-md
            focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2
            flex items-center justify-center gap-2.5"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Analyze Crop
            </>
          )}
        </button>
      </form>

      {/* ── Loading ──────────────────────────────────────────── */}
      {status === 'loading' && <LoadingSpinner />}

      {/* ── Error ────────────────────────────────────────────── */}
      {status === 'error' && (
        <ErrorBanner message={errorMsg} onRetry={handleRetry} />
      )}

      {/* ── Result ───────────────────────────────────────────── */}
      {status === 'success' && advisory && (
        <div ref={resultRef} tabIndex={-1}>
          <AdvisoryResult advisory={advisory} />
        </div>
      )}
    </div>
  );
}
