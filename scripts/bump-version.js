const fs = require('fs');
const path = require('path');

// Paths (relative to repo root)
const gradlePath = path.resolve(__dirname, '../android/app/build.gradle');
const iosPlistPath = path.resolve(__dirname, '../ios/App/Info.plist');

// Read package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const newVersion = pkg.version;

function bumpInt(v) {
  const n = parseInt(v, 10);
  return isNaN(n) ? 1 : n + 1;
}

// Update Android build.gradle
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode \d+/, (match) => {
  const current = match.split(' ')[1];
  return `versionCode ${bumpInt(current)}`;
});
gradle = gradle.replace(/versionName ".+?"/, `versionName "${newVersion}"`);
fs.writeFileSync(gradlePath, gradle);

// Update iOS Info.plist if exists
if (fs.existsSync(iosPlistPath)) {
  let plist = fs.readFileSync(iosPlistPath, 'utf8');
  plist = plist.replace(/<key>CFBundleShortVersionString<\/key>\s*<string>.+?<\/string>/,
    `<key>CFBundleShortVersionString</key>\n<string>${newVersion}</string>`);
  plist = plist.replace(/<key>CFBundleVersion<\/key>\s*<string>(\d+)<\/string>/,
    (match, p1) => `<key>CFBundleVersion</key>\n<string>${bumpInt(p1)}</string>`);
  fs.writeFileSync(iosPlistPath, plist);
}

console.log('Version bump completed');
