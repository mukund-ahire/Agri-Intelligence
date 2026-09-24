interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="font-semibold text-red-800 text-sm">Analysis failed</p>
          <p className="text-red-700 text-sm mt-1">{message}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="self-start text-sm font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
      >
        Try again
      </button>
    </div>
  );
}
