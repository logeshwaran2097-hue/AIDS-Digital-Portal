const fs = require('fs');
const file = 'd:/app/src/app/dashboard/attendance/components/ApplyODPermissionModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add editData to Props
content = content.replace(
  "onApplicationSuccess?: (appData: any) => void",
  "onApplicationSuccess?: (appData: any) => void\n  editData?: any"
);

// Add editData to function signature
content = content.replace(
  "userName,\n  onApplicationSuccess,\n}: ApplyODPermissionModalProps)",
  "userName,\n  onApplicationSuccess,\n  editData,\n}: ApplyODPermissionModalProps)"
);

content = content.replace(
  "userName,\r\n  onApplicationSuccess,\r\n}: ApplyODPermissionModalProps)",
  "userName,\r\n  onApplicationSuccess,\r\n  editData,\r\n}: ApplyODPermissionModalProps)"
);

content = content.replace(
  "userName,\n  onApplicationSuccess\n}: ApplyODPermissionModalProps)",
  "userName,\n  onApplicationSuccess,\n  editData\n}: ApplyODPermissionModalProps)"
);

// Add useEffect to set state based on editData
const useEffectHook = `
  useEffect(() => {
    if (editData && isOpen) {
      setAppType(editData.applicationType || 'Technical Hackathon / Competition OD');
      setFromDate(editData.fromDate || '');
      setToDate(editData.toDate || '');
      setEventName(editData.eventName || '');
      setReason(editData.reason || '');
    } else if (!isOpen) {
      // Reset form when closed
      setFromDate('');
      setToDate('');
      setEventName('');
      setReason('');
      setSubmitted(false);
    }
  }, [editData, isOpen]);
`;

content = content.replace(
  "const [submitted, setSubmitted] = useState(false)",
  "const [submitted, setSubmitted] = useState(false)\n" + useEffectHook
);

// Update handleSubmit to use PUT when editData exists
const fetchLogic = `
      let method = 'POST'
      let payload: any = {
        registerNumber: student.registerNumber,
        year: student.year,
        semester: student.semester,
        section: student.section,
        fromDate,
        toDate,
        applicationType: appType,
        eventName,
        organizer,
        reason,
        teamName,
        teamMembers,
      }

      if (editData?.id) {
        method = 'PUT'
        payload.auditLogId = editData.id
      }

      const res = await fetch('/api/od-applications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
`;

// Replace the old fetch block
content = content.replace(
  /const res = await fetch\('\/api\/od-applications', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{\s*registerNumber[\s\S]*?teamMembers,\s*\}\),\s*\}\)/m,
  fetchLogic.trim()
);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched ApplyODPermissionModal.tsx');
