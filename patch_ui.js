const fs = require('fs');
const file = 'd:/app/src/app/dashboard/attendance/components/ApplyODPermissionModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "Apply for On-Duty (OD) / Leave with Proofs",
  "{editData?.id ? 'Edit OD / Leave Application' : 'Apply for On-Duty (OD) / Leave with Proofs'}"
);

content = content.replace(
  "<span>Submit Permission Application</span>",
  "<span>{editData?.id ? 'Update' : 'Submit'} Permission Application</span>"
);

content = content.replace(
  "<h3 className=\"text-xl font-black text-[#071A3D]\">Application Submitted Successfully</h3>",
  "<h3 className=\"text-xl font-black text-[#071A3D]\">{editData?.id ? 'Application Updated Successfully' : 'Application Submitted Successfully'}</h3>"
);

content = content.replace(
  "toast.success('Permission request submitted with all proofs!')",
  "toast.success(editData?.id ? 'Application updated successfully!' : 'Permission request submitted with all proofs!')"
);

fs.writeFileSync(file, content, 'utf8');
console.log('UI text patched');
