import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4 font-sans">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-6xl font-black text-blue-500">404</h1>
        <h2 className="text-xl font-bold">Page Not Found</h2>
        <p className="text-sm text-slate-400">The page or resource you are looking for does not exist or has been moved.</p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all"
          >
            Return to Portal Home
          </Link>
        </div>
      </div>
    </div>
  )
}
