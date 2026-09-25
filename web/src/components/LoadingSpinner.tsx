export default function LoadingSpinner() {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-5"
      role="status"
      aria-live="polite"
      aria-label="Analyzing your crop, please wait"
    >
      {/* Spinner with pulsing ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-green-100 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-green-700 font-bold text-base">Analyzing your crop…</p>
        <p className="text-gray-500 text-sm max-w-xs text-center leading-relaxed">
          Fetching regional weather data and running Gemini AI analysis.
          This usually takes 5–10 seconds.
        </p>
      </div>

      {/* Progress steps */}
      <div className="w-full max-w-xs space-y-2">
        {[
          'Reading crop image',
          'Fetching weather context',
          'Running Gemini analysis',
          'Generating advisory',
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full border-2 border-green-300 border-t-green-600 animate-spin shrink-0"
              style={{ animationDelay: `${i * 0.25}s` }}
              aria-hidden="true"
            />
            <span className="text-xs text-gray-500">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
