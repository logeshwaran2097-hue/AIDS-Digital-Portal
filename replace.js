const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:/app/src');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // First remove the bracketed versions
    content = content.replace(/ \((?:Freshman|Sophomore|Junior|Senior)\)/g, '');
    
    // Then replace any remaining occurrences
    content = content.replace(/Freshman/g, 'Year I');
    content = content.replace(/Sophomore/g, 'Year II');
    content = content.replace(/Junior/g, 'Year III');
    content = content.replace(/Senior/g, 'Year IV');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log('Updated: ' + file);
    }
});

console.log('Total files changed: ' + changedFiles);
