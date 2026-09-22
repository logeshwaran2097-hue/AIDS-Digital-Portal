const fs = require('fs');
const file = 'd:/app/src/components/od/ODApplicationsDashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add editData state and handlers
const stateHook = `
  const [selectedODModal, setSelectedODModal] = useState<any | null>(null)
  const [editApplicationData, setEditApplicationData] = useState<any | null>(null)

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw and delete this application?')) return
    
    try {
      const res = await fetch(\`/api/od-applications?id=\${appId}\`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Application deleted successfully')
        fetchApplications(true)
      } else {
        const data = await res.json()
        toast.error(data.message || 'Failed to delete application')
      }
    } catch (e) {
      toast.error('Network error')
    }
  }
`;

content = content.replace("const [selectedODModal, setSelectedODModal] = useState<any | null>(null)", stateHook);

// Edit/Delete buttons template
const buttonsHTML = `
                        {/* Audit & Review Modal */}
                        <button
                          type="button"
                          onClick={() => setSelectedODModal(app)}
                          className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        {viewRole === 'student' && app.status === 'pending_advisor_approval' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditApplicationData(app);
                                setIsApplyModalOpen(true);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Edit Application"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteApplication(app.id)}
                              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Delete Application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
`;

content = content.replace(
  /\{\/\*\s*Audit & Review Modal\s*\*\/\}\s*<button\s*type="button"\s*onClick=\{\(\) => setSelectedODModal\(app\)\}\s*className="px-3\.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs\s*font-bold flex items-center gap-1\.5 transition-all cursor-pointer"\s*>\s*<Eye className="w-3\.5 h-3\.5 text-gray-600" \/>\s*<\/button>/m,
  buttonsHTML
);

// Card view buttons
const cardButtonsHTML = `
                            <button
                              type="button"
                              onClick={() => setSelectedODModal(app)}
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
                              title="Open Audit Modal"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {viewRole === 'student' && app.status === 'pending_advisor_approval' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditApplicationData(app);
                                    setIsApplyModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all cursor-pointer"
                                  title="Edit Application"
                                >
                                  <Sparkles className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteApplication(app.id)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-all cursor-pointer"
                                  title="Delete Application"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
`;

content = content.replace(
  /<button\s*type="button"\s*onClick=\{\(\) => setSelectedODModal\(app\)\}\s*className="p-1\.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all\s*cursor-pointer"\s*title="Open Audit Modal"\s*>\s*<Eye className="w-4 h-4" \/>\s*<\/button>/m,
  cardButtonsHTML
);

// Add editData to modal props
content = content.replace(
  "onClose={() => setIsApplyModalOpen(false)}",
  "onClose={() => { setIsApplyModalOpen(false); setEditApplicationData(null); }}\n            editData={editApplicationData}"
);

// Add Sparkles and Trash2 to imports if not there
if (!content.includes('Trash2')) {
  content = content.replace(
    "Eye,",
    "Eye,\n  Trash2,\n  Sparkles,"
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('Patched ODApplicationsDashboardView.tsx');
