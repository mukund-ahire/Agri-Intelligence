import AdvisoryForm from '@/components/AdvisoryForm';

export default function Home() {
  return (
    <div className="space-y-6 pt-6">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm px-5 py-6 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            AI Advisory
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 leading-snug">
          Localized AI-Powered<br />Agricultural Advisory
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
          Share your crop photo, location and crop type. Gemini AI will combine
          real-time weather data with agricultural context to generate a
          personalized advisory — including possible issues, recommended actions
          and prevention guidance.
        </p>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1 flex items-start gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          This is an AI-assisted advisory, not a definitive disease diagnosis.
          Consult a local agricultural extension officer for confirmation.
        </p>
      </div>

      {/* ── Form ─────────────────────────────────────────────── */}
      <AdvisoryForm />
    </div>
  );
}
