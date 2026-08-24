'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function LiveLocalPage() {
  const pathname = usePathname()
  const isLocalhost = pathname === '/dashboard/live-local'

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Live Local Link</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-medium mb-4">Local Network Access</h2>
        <p className="text-muted-foreground mb-4">
          The application is running locally and can be accessed from other devices on your network.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium mb-2">Local URL:</p>
          <code className="block bg-white px-3 py-2 rounded mt-1 w-full text-sm font-mono break-all">
            http://&lt;your-ip&gt;:3001
          </code>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Network Access:</p>
          <code className="block bg-white px-3 py-2 rounded mt-1 w-full text-sm font-mono break-all">
            http://localhost:3001
          </code>
        </div>
        <Button
          onClick={() => navigator.clipboard.writeText('http://localhost:3001')}
          className="w-full mt-4"
        >
          Copy Local URL
        </Button>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          To make this accessible externally, ensure the dev server is running with the
          correct hostname configuration.
        </p>
        <details className="mt-4">
          <summary>Development commands</summary>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Run: <code>HOST=0.0.0.0 npx next dev</code></li>
            <li>Or set <code>HOST=0.0.0.0</code> in <code>.env</code></li>
          </ul>
        </details>
      </div>
    </div>
  )
}