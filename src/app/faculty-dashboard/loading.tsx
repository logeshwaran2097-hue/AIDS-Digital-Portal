export default function FacultyLoading() {
  return (
    <div className="space-y-6 animate-pulse p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="h-36 rounded-3xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 shadow-sm" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white border border-gray-200 p-4 space-y-3 shadow-xs">
            <div className="h-4 w-24 bg-gray-200 rounded-md" />
            <div className="h-8 w-16 bg-gray-300 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="h-96 rounded-3xl bg-white border border-gray-200 p-6 space-y-4 shadow-xs">
        <div className="h-6 w-48 bg-gray-200 rounded-md" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
