import { AIAdvisoryResponse } from '@/types/advisory';

interface AdvisoryResultProps {
  advisory: AIAdvisoryResponse;
}

type Level = 'High' | 'Medium' | 'Low';

const levelStyle: Record<Level, string> = {
  High: 'bg-red-100 text-red-800 border border-red-200',
  Medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  Low: 'bg-green-100 text-green-800 border border-green-200',
};

function Badge({ level, label }: { level: Level; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${levelStyle[level]}`}
      aria-label={`${label}: ${level}`}
    >
      {level}
    </span>
  );
}

function Section({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-green-600" aria-hidden="true">{icon}</span>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function AdvisoryResult({ advisory }: AdvisoryResultProps) {
  return (
    <section aria-label="AI Advisory Result" className="space-y-3 mt-2">
      {/* Header */}
      <div className="bg-green-700 text-white rounded-xl p-4 space-y-1">
        <p className="text-xs font-medium text-green-200 uppercase tracking-widest">Advisory Result</p>
        <h2 className="text-xl font-bold">{advisory.crop}</h2>
        <p className="text-green-100 text-sm font-medium">{advisory.possible_issue}</p>
      </div>

      {/* Confidence + Severity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Confidence</p>
            <Badge level={advisory.confidence} label="Confidence" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Severity</p>
            <Badge level={advisory.severity} label="Severity" />
          </div>
        </div>
      </div>

      {/* Observations */}
      {advisory.observations.length > 0 && (
        <Section
          title="Observations"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        >
          <BulletList items={advisory.observations} />
        </Section>
      )}

      {/* Recommended Actions */}
      {advisory.recommended_actions.length > 0 && (
        <Section
          title="Recommended Actions"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        >
          <BulletList items={advisory.recommended_actions} />
        </Section>
      )}

      {/* Prevention */}
      {advisory.prevention.length > 0 && (
        <Section
          title="Prevention"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        >
          <BulletList items={advisory.prevention} />
        </Section>
      )}

      {/* Weather Considerations */}
      {advisory.weather_considerations.length > 0 && (
        <Section
          title="Weather Context"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          }
        >
          <BulletList items={advisory.weather_considerations} />
        </Section>
      )}

      {/* Limitations / Disclaimer */}
      {advisory.limitations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="font-semibold text-amber-800 text-sm uppercase tracking-wide">Important Limitations</h3>
          </div>
          <ul className="space-y-1.5 pl-1">
            {advisory.limitations.map((item, i) => (
              <li key={i} className="text-sm text-amber-900">{item}</li>
            ))}
          </ul>
          <p className="text-xs text-amber-700 pt-1 border-t border-amber-200">
            This is an AI-generated advisory based on visual analysis. Always consult a qualified agricultural extension officer for a definitive diagnosis.
          </p>
        </div>
      )}
    </section>
  );
}
