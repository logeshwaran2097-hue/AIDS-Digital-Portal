const fs = require('fs');
const file = 'd:/app/src/components/od/ODApplicationsDashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "<AdvisorODReviewModal\r\n          isOpen={Boolean(selectedODModal)}\r\n          onClose={() => setSelectedODModal(null)}\r\n          application={selectedODModal}",
  "<AdvisorODReviewModal\r\n          isOpen={Boolean(selectedODModal)}\r\n          onClose={() => setSelectedODModal(null)}\r\n          application={selectedODModal}\r\n          viewRole={viewRole}"
);

content = content.replace(
  "<AdvisorODReviewModal\n          isOpen={Boolean(selectedODModal)}\n          onClose={() => setSelectedODModal(null)}\n          application={selectedODModal}",
  "<AdvisorODReviewModal\n          isOpen={Boolean(selectedODModal)}\n          onClose={() => setSelectedODModal(null)}\n          application={selectedODModal}\n          viewRole={viewRole}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched ODApplicationsDashboardView.tsx for viewRole');
