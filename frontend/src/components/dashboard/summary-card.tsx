type SummaryCardProps = {
  label: string;
  value: number;
  description?: string;
};

export function SummaryCard({ label, value, description }: SummaryCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-xs text-slate-500">{description}</p>
      )}
    </article>
  );
}
