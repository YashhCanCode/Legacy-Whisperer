/**
 * Diff Parser Module
 * 
 * Parses git diff output to extract structured information about code changes,
 * including filenames, changed functions, added/removed lines, and summaries.
 */

/**
 * Parse a raw git diff string and extract structured change information
 * @param {string} rawDiff - Raw git diff output
 * @returns {Array<Object>} Array of parsed file change objects
 */
export default function parseDiff(rawDiff) {
  if (!rawDiff || !rawDiff.trim()) {
    return [];
  }

  const files = [];
  
  // Split diff into individual file sections
  // Each file section starts with "diff --git"
  const fileSections = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const section of fileSections) {
    const fileData = parseFileSection(section);
    if (fileData) {
      files.push(fileData);
    }
  }

  return files;
}

/**
 * Parse a single file's diff section
 * @param {string} section - Diff section for one file
 * @returns {Object|null} Parsed file data or null if invalid
 */
function parseFileSection(section) {
  // Extract filename from the +++ b/filename line
  const filenameMatch = section.match(/^\+\+\+ b\/(.+)$/m);
  if (!filenameMatch) {
    return null;
  }

  const filename = filenameMatch[1];
  
  // Extract all hunks (sections of changes)
  const hunks = extractHunks(section);
  
  // Parse changes from hunks
  const addedLines = [];
  const removedLines = [];
  const changedFunctions = new Set();
  
  for (const hunk of hunks) {
    // Extract added lines (lines starting with +, but not +++)
    const added = hunk.match(/^\+(?!\+\+)(.*)$/gm);
    if (added) {
      addedLines.push(...added.map(line => line.substring(1)));
    }
    
    // Extract removed lines (lines starting with -, but not ---)
    const removed = hunk.match(/^-(?!--)(.*)$/gm);
    if (removed) {
      removedLines.push(...removed.map(line => line.substring(1)));
    }
    
    // Identify functions affected by changes
    const functions = identifyChangedFunctions(hunk);
    functions.forEach(fn => changedFunctions.add(fn));
  }

  // Generate a plain-English summary
  const summary = generateSummary(filename, addedLines, removedLines, changedFunctions);

  return {
    file: filename,
    changedFunctions: Array.from(changedFunctions),
    addedLines: addedLines,
    removedLines: removedLines,
    summary: summary
  };
}

/**
 * Extract hunks (change sections) from a diff
 * @param {string} section - File diff section
 * @returns {Array<string>} Array of hunk strings
 */
function extractHunks(section) {
  const hunks = [];
  
  // Split by hunk headers (@@ ... @@)
  const hunkPattern = /^@@.*?@@.*$/gm;
  const parts = section.split(hunkPattern);
  
  // Skip the first part (file headers) and process hunks
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].trim()) {
      hunks.push(parts[i]);
    }
  }
  
  return hunks;
}

/**
 * Identify function names near changed lines
 * @param {string} hunk - A hunk of diff changes
 * @returns {Array<string>} Array of function names
 */
function identifyChangedFunctions(hunk) {
  const functions = new Set();
  const lines = hunk.split('\n');
  
  // Track the current function context
  let currentFunction = null;
  
  for (const line of lines) {
    // Look for function declarations in context or changed lines
    // JavaScript/TypeScript patterns
    let match = line.match(/(?:function|const|let|var|async)\s+(\w+)\s*[=\(]/);
    if (match) {
      currentFunction = match[1];
    }
    
    // Arrow functions: const name = () =>
    match = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);
    if (match) {
      currentFunction = match[1];
    }
    
    // Method definitions: methodName() { or async methodName() {
    match = line.match(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/);
    if (match && !['if', 'for', 'while', 'switch', 'catch'].includes(match[1])) {
      currentFunction = match[1];
    }
    
    // Class methods: async methodName(
    match = line.match(/^\s*(?:async\s+)?(\w+)\s*\(/);
    if (match && !['if', 'for', 'while', 'switch', 'catch', 'return'].includes(match[1])) {
      currentFunction = match[1];
    }
    
    // If this is a changed line (+ or -) and we have a function context
    if ((line.startsWith('+') || line.startsWith('-')) && currentFunction) {
      // Skip lines that are just braces or whitespace
      const content = line.substring(1).trim();
      if (content && content !== '{' && content !== '}') {
        functions.add(currentFunction);
      }
    }
  }
  
  return Array.from(functions);
}

/**
 * Generate a plain-English summary of changes
 * @param {string} filename - Name of the changed file
 * @param {Array<string>} addedLines - Lines that were added
 * @param {Array<string>} removedLines - Lines that were removed
 * @param {Set<string>} changedFunctions - Functions that were modified
 * @returns {string} Human-readable summary
 */
function generateSummary(filename, addedLines, removedLines, changedFunctions) {
  const parts = [];
  
  // File type
  const ext = filename.split('.').pop();
  
  // Count meaningful changes (skip empty lines and braces)
  const meaningfulAdds = addedLines.filter(line => {
    const trimmed = line.trim();
    return trimmed && trimmed !== '{' && trimmed !== '}' && trimmed !== ';';
  }).length;
  
  const meaningfulRemoves = removedLines.filter(line => {
    const trimmed = line.trim();
    return trimmed && trimmed !== '{' && trimmed !== '}' && trimmed !== ';';
  }).length;
  
  // Describe the type of change
  if (meaningfulAdds > 0 && meaningfulRemoves > 0) {
    parts.push('Modified');
  } else if (meaningfulAdds > 0) {
    parts.push('Added');
  } else if (meaningfulRemoves > 0) {
    parts.push('Removed');
  }
  
  // Describe what changed
  if (changedFunctions.size > 0) {
    const funcList = Array.from(changedFunctions).slice(0, 3).join(', ');
    const more = changedFunctions.size > 3 ? ` and ${changedFunctions.size - 3} more` : '';
    parts.push(`code in ${funcList}${more}`);
  } else {
    parts.push(`${meaningfulAdds + meaningfulRemoves} line(s)`);
  }
  
  // Add context about the change magnitude
  const totalChanges = meaningfulAdds + meaningfulRemoves;
  if (totalChanges > 50) {
    parts.push('(major refactor)');
  } else if (totalChanges > 20) {
    parts.push('(significant changes)');
  } else if (totalChanges > 5) {
    parts.push('(moderate changes)');
  } else {
    parts.push('(minor changes)');
  }
  
  return parts.join(' ');
}

/**
 * Named export for backward compatibility
 */
export { parseDiff };

// Made with Bob
