export default function Loading() {
  return (
    <div className="container section">
      <div className="glass h-40 animate-pulse rounded-[28px]" />
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <div className="glass h-64 animate-pulse rounded-[28px]" />
        <div className="glass h-64 animate-pulse rounded-[28px]" />
        <div className="glass h-64 animate-pulse rounded-[28px]" />
      </div>
    </div>
  );
}

