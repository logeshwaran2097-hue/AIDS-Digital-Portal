import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { Database, Download, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HODResourcesPage() {
  const session = await requireRoleSession(['hod'])

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  const published = resources.filter((r) => r.status === 'published')
  const pending = resources.filter((r) => r.status === 'pending')

  return (
    <PortalLayout role="hod" userName={session.name || 'Head of Department'}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#071A3D] via-[#0A2A5E] to-[#1455D9] text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4C430] text-[#071A3D] text-[10px] font-black uppercase tracking-wider">
                Resource Approvals
              </span>
            </div>
            <h1 className="text-2xl font-black">Study Materials &amp; Academic Notes</h1>
            <p className="text-xs text-gray-300 mt-1">
              Review and approve faculty-uploaded study notes, lab manuals, and question banks
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs font-bold text-gray-500">Total Materials</p>
            <p className="text-2xl font-black text-[#071A3D] mt-1">{resources.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-green-200 shadow-xs bg-green-50/20">
            <p className="text-xs font-bold text-green-700">Approved &amp; Live</p>
            <p className="text-2xl font-black text-green-600 mt-1">{published.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
            <p className="text-xs font-bold text-amber-700">Pending Review</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{pending.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs font-bold text-gray-500">Department</p>
            <p className="text-2xl font-black text-[#1455D9] mt-1">AI &amp; DS</p>
          </div>
        </div>

        {/* Resources List */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#071A3D]">All Uploaded Course Resources ({resources.length})</h2>
            <Badge variant="info">{resources.length} Total Files</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#071A3D] text-white">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Resource Title</th>
                  <th className="py-3.5 px-3 font-bold text-center">Type</th>
                  <th className="py-3.5 px-3 font-bold text-center">Size</th>
                  <th className="py-3.5 px-4 font-bold">Uploaded By</th>
                  <th className="py-3.5 px-3 font-bold text-center">Date</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resources.length > 0 ? (
                  resources.map((r: any) => (
                    <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#071A3D]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#1455D9] shrink-0" />
                          <div>
                            <div>{r.name}</div>
                            <div className="text-[10px] text-gray-400 font-normal">{r.fileName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge variant="info" className="uppercase text-[9px]">{r.resourceType || 'NOTES'}</Badge>
                      </td>
                      <td className="py-3.5 px-3 text-center text-gray-500">
                        {((r.fileSize || 0) / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-medium">
                        {r.uploadedByName || 'Faculty Member'}
                      </td>
                      <td className="py-3.5 px-3 text-center text-gray-500">{formatDate(r.createdAt)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                          {r.status || 'Published'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <a
                          href={r.fileUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-gray-100 hover:bg-[#1455D9] hover:text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400 font-medium">
                      No course materials uploaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
