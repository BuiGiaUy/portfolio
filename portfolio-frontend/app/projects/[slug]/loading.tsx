export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container-custom py-12">
        <div className="animate-pulse space-y-8">
          {/* Back button skeleton */}
          <div className="h-4 w-32 bg-[var(--neutral-800)] rounded"></div>

          {/* Title skeleton */}
          <div className="space-y-3">
            <div className="h-10 w-3/4 bg-[var(--neutral-800)] rounded"></div>
            <div className="h-6 w-full max-w-2xl bg-[var(--neutral-800)] rounded"></div>
          </div>

          {/* Tech stack skeleton */}
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-[var(--neutral-800)] rounded-md"></div>
            <div className="h-8 w-20 bg-[var(--neutral-800)] rounded-md"></div>
            <div className="h-8 w-28 bg-[var(--neutral-800)] rounded-md"></div>
            <div className="h-8 w-24 bg-[var(--neutral-800)] rounded-md"></div>
          </div>

          {/* Meta info skeleton */}
          <div className="flex gap-4">
            <div className="h-5 w-20 bg-[var(--neutral-800)] rounded"></div>
            <div className="h-5 w-16 bg-[var(--neutral-800)] rounded"></div>
            <div className="h-5 w-20 bg-[var(--neutral-800)] rounded"></div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--neutral-800)] my-8"></div>

          {/* Content skeleton */}
          <div className="space-y-6 max-w-4xl">
            <div className="space-y-3">
              <div className="h-8 w-48 bg-[var(--neutral-800)] rounded"></div>
              <div className="h-4 w-full bg-[var(--neutral-800)] rounded"></div>
              <div className="h-4 w-5/6 bg-[var(--neutral-800)] rounded"></div>
              <div className="h-4 w-4/6 bg-[var(--neutral-800)] rounded"></div>
            </div>

            <div className="space-y-3">
              <div className="h-8 w-56 bg-[var(--neutral-800)] rounded"></div>
              <div className="h-4 w-full bg-[var(--neutral-800)] rounded"></div>
              <div className="h-4 w-full bg-[var(--neutral-800)] rounded"></div>
              <div className="h-4 w-3/4 bg-[var(--neutral-800)] rounded"></div>
            </div>

            <div className="space-y-3">
              <div className="h-8 w-40 bg-[var(--neutral-800)] rounded"></div>
              <div className="h-4 w-full bg-[var(--neutral-800)] rounded"></div>
              <div className="h-4 w-4/5 bg-[var(--neutral-800)] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
