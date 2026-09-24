export default function LoadingSpinner() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-12"
      role="status"
      aria-live="polite"
      aria-label="Analyzing your crop, please wait"
    >
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
      </div>
      <p className="text-green-700 font-semibold text-lg">Analyzing your crop…</p>
      <p className="text-gray-500 text-sm text-center max-w-xs">
        Fetching weather data and running Gemini AI analysis. This may take a few seconds.
      </p>
    </div>
  );
}
