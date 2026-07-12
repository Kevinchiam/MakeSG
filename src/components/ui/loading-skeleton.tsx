export function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse border border-[#e4ded4] bg-white p-4">
          <div className="h-36 bg-[#eee7dc]" />
          <div className="mt-4 h-5 w-3/4 bg-[#eee7dc]" />
          <div className="mt-3 h-4 w-full bg-[#eee7dc]" />
          <div className="mt-2 h-4 w-2/3 bg-[#eee7dc]" />
        </div>
      ))}
    </div>
  );
}
