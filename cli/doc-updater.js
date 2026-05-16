import fs from 'fs';

function applyFix(docPath, lineNumber, newText) {
  // Read file
  const content = fs.readFileSync(docPath, 'utf8');
  
  // Split into lines
  const lines = content.split('\n');
  
  // Log for debugging
  console.log(`Fixing ${docPath}`);
  console.log(`Total lines: ${lines.length}`);
  console.log(`Line ${lineNumber} current: "${lines[lineNumber - 1]}"`);
  console.log(`Replacing with: "${newText}"`);
  
  // Replace line (lineNumber is 1-indexed)
  lines[lineNumber - 1] = newText;
  
  // Write back
  fs.writeFileSync(docPath, lines.join('\n'), 'utf8');
  
  console.log(`✅ Fixed: ${docPath} line ${lineNumber}`);
  return true;
}

export { applyFix };

// Made with Bob
