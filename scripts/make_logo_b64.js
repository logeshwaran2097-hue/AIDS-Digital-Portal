const fs = require('fs');
const buf = fs.readFileSync('public/vsb-logo.png');
const b64 = buf.toString('base64');
fs.writeFileSync('src/lib/logoBase64.ts', 'export const VSB_LOGO_BASE64 = "data:image/png;base64,' + b64 + '";\n');
console.log('Successfully saved src/lib/logoBase64.ts with length:', b64.length);
