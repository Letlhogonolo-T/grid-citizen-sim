export function MetricCard({
  label,
  value,
  unit,
  accent = 'cyan',
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: 'cyan' | 'amber' | 'violet' | 'red';
  hint?: string;
}) {
  const color = `var(--${accent})`;
  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-1 min-w-0"
      style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
    >
      <span className="text-[11px] uppercase tracking-wide truncate" style={{ color: 'var(--text-dim)' }}>
        {label}
      </span>
      <span className="font-mono text-2xl md:text-3xl" style={{ color }}>
        {value}
        {unit && <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>{unit}</span>}
      </span>
      {hint && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </span>
      )}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border p-4 md:p-5 ${className}`}
      style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
    >
      <div className="mb-3">
        <h3 className="font-display text-sm tracking-wide" style={{ color: 'var(--text)' }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
