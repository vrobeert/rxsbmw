interface SkeletonLoaderProps {
  readonly rows?: number;
}

export const SkeletonLoader = ({ rows = 3 }: SkeletonLoaderProps) => (
  <div className="space-y-3">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="skeleton-shine relative h-20 overflow-hidden rounded-2xl bg-white/7" />
    ))}
  </div>
);
