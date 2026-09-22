const fs = require('fs');
const file = 'd:/app/src/components/od/AdvisorODReviewModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `{/* Endorsement Actions for Class Advisor */}`;
const replaceStr = `{viewRole !== 'student' && (
            <>
            {/* Endorsement Actions for Class Advisor */}`;

content = content.replace(targetStr, replaceStr);

const endStr = `{/* Footer Brand */}`;
const replaceEndStr = `</>
          )}
          {/* Footer Brand */}`;

content = content.replace(endStr, replaceEndStr);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched AdvisorODReviewModal.tsx');
