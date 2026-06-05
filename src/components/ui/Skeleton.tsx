/** Reusable loading skeleton blocks */

export const SkeletonLine = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} animate-pulse rounded-lg bg-slate-200`} />
);

export const SkeletonCard = ({ rows = 3 }: { rows?: number }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonLine key={i} w={i === 0 ? 'w-1/3' : i % 2 === 0 ? 'w-2/3' : 'w-full'} />
    ))}
  </div>
);

export const PageLoader = ({ label = 'Loading…' }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
    <span className="text-sm">{label}</span>
  </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} rows={2} />
    ))}
  </div>
);
