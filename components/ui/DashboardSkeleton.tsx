export default function DashboardSkeleton () {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-pulse">
      <div className="h-8 bg-surface rounded w-48 mb-2" />
      <div className="h-4 bg-surface rounded w-72 mb-8" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-24" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card h-80" />
        <div className="space-y-4">
          <div className="card h-36" />
          <div className="card h-40" />
        </div>
      </div>
    </div>
  )

}