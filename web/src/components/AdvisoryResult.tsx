import { AIAdvisoryResponse } from '@/types/advisory';

interface AdvisoryResultProps {
  advisory: AIAdvisoryResponse;
}

type Level = 'High' | 'Medium' | 'Low';

/* ── Badge colours ───────────────────────────────────────────────── */
const confidenceStyle: Record<Level, { bg: string; text: string; dot: string; label: string }> = {
  High:   { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500',  label: 'High confidence' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Medium confidence' },
  Low:    { bg: 'bg-gray-100',   text: 'text-gray-700',   dot: 'bg-gray-400',   label: 'Low confidence' },
};

const severityStyle: Record<Level, { bg: string; text: string; bar: string; label: string }> = {
  High:   { bg: 'bg-red-100',    text: 'text-red-800',    bar: 'bg-red-500',    label: 'High severity' },
  Medium: { bg: 'bg-orange-100', text: 'text-orange-800', bar: 'bg-orange-400', label: 'Medium severity' },
  Low:    { bg: 'bg-green-100',  text: 'text-green-800',  bar: 'bg-green-500',  label: 'Low severity' },
};

/* ── Small components ────────────────────────────────────────────── */
function ConfidenceBadge({ level }: { level: Level }) {
  const s = confidenceStyle[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}
      aria-label={s.label}
    >
      <span className={`w-2 h-2 rounded-full ${s.dot}`} aria-hidden="true" />
      {level}
    </span>
  );
}

function SeverityBadge({ level }: { level: Level }) {
  const s = severityStyle[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}
      aria-label={s.label}
    >
      <span className={`w-2 h-2 rounded-full ${s.bar}`} aria-hidden="true" />
      {level}
    </span>
  );
}

/* ── Section card ────────────────────────────────────────────────── */
function ResultSection({
  title,
  icon,
  children,
  accent = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border shadow-sm p-4 space-y-3 ${accent ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center gap-2">
        <span className={accent ? 'text-amber-600' : 'text-green-600'} aria-hidden="true">
          {icon}
        </span>
        <h3 className={`font-bold text-xs uppercase tracking-wider ${accent ? 'text-amber-800' : 'text-gray-700'}`}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

/* ── Bullet list ─────────────────────────────────────────────────── */
function BulletList({ items, accent = false }: { items: string[]; accent?: boolean }) {
  return (
    <ul className="space-y-2 pl-0.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm">
          <span
            className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${accent ? 'bg-amber-500' : 'bg-green-500'}`}
            aria-hidden="true"
          />
          <span className={accent ? 'text-amber-900' : 'text-gray-700'}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── Action list (numbered, more prominent) ──────────────────────── */
function ActionList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          <span
            className="shrink-0 w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <span className="text-gray-700">{item}</span>
        </li>
      ))}
    </ol>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function AdvisoryResult({ advisory }: AdvisoryResultProps) {
  return (
    <section aria-label="AI Advisory Result" className="space-y-3 mt-2">

      {/* ── Result header ─────────────────────────────────── */}
      <div className="bg-green-800 text-white rounded-2xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-green-300 uppercase tracking-widest mb-1">
              Advisory Result
            </p>
            <h2 className="text-2xl font-extrabold leading-tight">{advisory.crop}</h2>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-full bg-green-700 border border-green-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        {/* Possible issue */}
        <div className="bg-green-700/60 rounded-xl px-4 py-3">
          <p className="text-[11px] font-semibold text-green-300 uppercase tracking-wide mb-0.5">
            Detected / Possible Issue
          </p>
          <p className="text-white font-bold text-base leading-snug">{advisory.possible_issue}</p>
        </div>

        {/* Confidence + Severity badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wide">Confidence</span>
            <ConfidenceBadge level={advisory.confidence} />
          </div>
          <div className="w-px bg-green-700 mx-1" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wide">Severity</span>
            <SeverityBadge level={advisory.severity} />
          </div>
        </div>
      </div>

      {/* ── Observations ─────────────────────────────────── */}
      {advisory.observations.length > 0 && (
        <ResultSection
          title="Key Observations"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        >
          <BulletList items={advisory.observations} />
        </ResultSection>
      )}

      {/* ── Recommended Actions ──────────────────────────── */}
      {advisory.recommended_actions.length > 0 && (
        <ResultSection
          title="Recommended Actions"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        >
          <ActionList items={advisory.recommended_actions} />
        </ResultSection>
      )}

      {/* ── Prevention ───────────────────────────────────── */}
      {advisory.prevention.length > 0 && (
        <ResultSection
          title="Prevention"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        >
          <BulletList items={advisory.prevention} />
        </ResultSection>
      )}

      {/* ── Weather Considerations ───────────────────────── */}
      {advisory.weather_considerations.length > 0 && (
        <ResultSection
          title="Weather Considerations"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          }
        >
          <BulletList items={advisory.weather_considerations} />
        </ResultSection>
      )}

      {/* ── Limitations / Disclaimer ─────────────────────── */}
      {advisory.limitations.length > 0 && (
        <ResultSection
          title="Important Limitations"
          accent
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        >
          <BulletList items={advisory.limitations} accent />
          <p className="text-xs text-amber-700 pt-2 border-t border-amber-200">
            This is an AI-generated advisory based on visual analysis. Always consult a
            qualified agricultural extension officer for a definitive diagnosis.
          </p>
        </ResultSection>
      )}
    </section>
  );
}
