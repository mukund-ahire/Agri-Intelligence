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

export default function AdvisoryForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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
    handleImageChange(e.dataTransfer.files?.[0] ?? null);
  }, [handleImageChange]);

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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* ── Step 1: Location ───────────────────────────── */}
        <fieldset className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <legend className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold" aria-hidden="true">1</span>
            Your Location
          </legend>

          {location.lat !== null && !location.manualMode ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-green-800 font-medium">{location.label}</span>
              </div>
              <button
                type="button"
                onClick={() => setLocation({ lat: null, lng: null, label: '', manualMode: false })}
                className="text-xs text-green-700 underline hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                aria-label="Change location"
              >
                Change
              </button>
            </div>
          ) : location.manualMode ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="manual-lat" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    id="manual-lat"
                    type="number"
                    step="any"
                    placeholder="e.g. 30.9009"
                    value={manualLat}
                    onChange={e => setManualLat(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-describedby="location-error"
                  />
                </div>
                <div>
                  <label htmlFor="manual-lng" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    id="manual-lng"
                    type="number"
                    step="any"
                    placeholder="e.g. 75.8572"
                    value={manualLng}
                    onChange={e => setManualLng(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-describedby="location-error"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleManualLocation}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Set Location
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={status === 'locating'}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Use current GPS location"
              >
                {status === 'locating' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    Getting location…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Use My Current Location
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setLocation(prev => ({ ...prev, manualMode: true }))}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
              >
                Enter coordinates manually
              </button>
            </div>
          )}

          {locationError && (
            <p id="location-error" role="alert" className="text-sm text-red-600 flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {locationError}
            </p>
          )}
        </fieldset>

        {/* ── Step 2: Crop ───────────────────────────────── */}
        <fieldset className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <legend className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold" aria-hidden="true">2</span>
            Select Crop
          </legend>
          <label htmlFor="crop-select" className="sr-only">Select crop type</label>
          <select
            id="crop-select"
            value={crop}
            onChange={e => { setCrop(e.target.value); setCropError(''); }}
            className={`w-full rounded-xl border px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${cropError ? 'border-red-400' : 'border-gray-300'}`}
            aria-describedby={cropError ? 'crop-error' : undefined}
            aria-required="true"
          >
            <option value="">Choose a crop…</option>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {cropError && (
            <p id="crop-error" role="alert" className="text-sm text-red-600">{cropError}</p>
          )}
        </fieldset>

        {/* ── Step 3: Image ──────────────────────────────── */}
        <fieldset className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <legend className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center font-bold" aria-hidden="true">3</span>
            Crop Photo
          </legend>

          {previewUrl ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview of uploaded crop"
                className="w-full rounded-xl object-cover max-h-64 border border-gray-200"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Replace Photo
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Remove selected photo"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              aria-label="Upload crop photo. Click or drag and drop a JPEG or PNG image."
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-green-400 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 ${imageError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
            >
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Tap to take or upload a photo</p>
              <p className="text-xs text-gray-400 mt-1">JPEG or PNG · max 10 MB</p>
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
            <p id="image-error" role="alert" className="text-sm text-red-600">{imageError}</p>
          )}
        </fieldset>

        {/* ── Submit ─────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Analyze Crop
            </>
          )}
        </button>
      </form>

      {/* ── Loading ───────────────────────────────────────── */}
      {status === 'loading' && <LoadingSpinner />}

      {/* ── Error ─────────────────────────────────────────── */}
      {status === 'error' && (
        <ErrorBanner message={errorMsg} onRetry={handleRetry} />
      )}

      {/* ── Result ────────────────────────────────────────── */}
      {status === 'success' && advisory && (
        <div ref={resultRef} tabIndex={-1}>
          <AdvisoryResult advisory={advisory} />
        </div>
      )}
    </div>
  );
}
