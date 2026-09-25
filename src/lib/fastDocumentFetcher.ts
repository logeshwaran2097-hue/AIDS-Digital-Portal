/**
 * Fast Document Fetching & Streaming Utility
 * Optimizes download speeds, URL resolution, and prefetching for academic documents.
 */

// In-memory cache for resolved document URLs
const documentUrlCache = new Map<string, string>()

// In-memory cache for downloaded ArrayBuffers
const documentBufferCache = new Map<string, ArrayBuffer>()

/**
 * Fast fetch document URL with memory + session caching
 */
export async function getFastDocumentUrl(resourceId: string): Promise<string | null> {
  if (documentUrlCache.has(resourceId)) {
    return documentUrlCache.get(resourceId)!
  }

  if (typeof window !== 'undefined') {
    const sessionCached = sessionStorage.getItem(`res_url_${resourceId}`)
    if (sessionCached) {
      documentUrlCache.set(resourceId, sessionCached)
      return sessionCached
    }
  }

  try {
    const res = await fetch(`/api/resources/${resourceId}/download`, {
      headers: {
        'Accept': 'application/json',
      },
    })
    const data = await res.json()
    if (data.success && data.fileUrl) {
      documentUrlCache.set(resourceId, data.fileUrl)
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`res_url_${resourceId}`, data.fileUrl)
        } catch {
          // ignore quota exceeded
        }
      }
      return data.fileUrl
    }
    return null
  } catch (err) {
    console.error('Fast fetch document URL error:', err)
    return null
  }
}

/**
 * Background prefetch a batch of resource URLs so clicks are instant
 */
export function prefetchDocumentUrls(resourceIds: string[]) {
  if (typeof window === 'undefined' || !Array.isArray(resourceIds)) return

  // Filter out already cached IDs
  const uncached = resourceIds.filter((id) => !documentUrlCache.has(id))
  if (uncached.length === 0) return

  // Run in idle callback or small timeout to not block UI rendering
  const schedule = window.requestIdleCallback || ((cb: any) => setTimeout(cb, 100))
  schedule(() => {
    // Prefetch top 10 items
    uncached.slice(0, 10).forEach(async (id) => {
      await getFastDocumentUrl(id).catch(() => {})
    })
  })
}

/**
 * Direct Instant Download: triggers browser download immediately in <100ms
 */
export function instantDirectDownload(fileUrl: string, fileName: string) {
  if (typeof window === 'undefined') return

  if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:') || fileUrl.startsWith('/uploads/')) {
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return
  }

  // Remote URL
  const a = document.createElement('a')
  a.href = fileUrl
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
