/**
 * Bob Bridge Module
 * 
 * Constructs prompts for AI analysis to identify outdated documentation
 * sections based on code changes. This module bridges the gap between
 * code diffs and AI-powered documentation analysis.
 */

import { writeFileSync } from 'fs';

/**
 * Analyze code changes and documentation with Bob
 * @param {Array} parsedDiff - Array of parsed diff objects from parseDiff()
 * @param {Array} matchedDocSections - Array of matched documentation sections
 * @returns {string} The constructed prompt for Bob
 */
export default function analyzeWithBob(parsedDiff, matchedDocSections) {
  // Construct the detailed analysis prompt
  const prompt = constructPrompt(parsedDiff, matchedDocSections);
  
  // Write prompt to temp file for manual use
  try {
    writeFileSync('/tmp/docsync-analysis.txt', prompt, 'utf-8');
  } catch (error) {
    console.warn('Warning: Could not write analysis prompt to /tmp/docsync-analysis.txt');
  }
  
  // Construct structured JSON input
  const jsonInput = {
    changedFiles: parsedDiff.map(change => ({
      file: change.file,
      changedFunctions: change.changedFunctions,
      addedLines: change.addedLines.length,
      removedLines: change.removedLines.length,
      summary: change.summary
    })),
    documentationSections: matchedDocSections.map(section => ({
      docPath: section.docPath,
      section: section.section,
      startLine: section.startLine,
      endLine: section.endLine,
      keyword: section.keyword
    })),
    question: "Which documentation sections are outdated based on these code changes?"
  };
  
  // Write JSON input to temp file
  try {
    writeFileSync('/tmp/docsync-input.json', JSON.stringify(jsonInput, null, 2), 'utf-8');
  } catch (error) {
    console.warn('Warning: Could not write JSON input to /tmp/docsync-input.json');
  }
  
  return prompt;
}

/**
 * Construct the analysis prompt for Bob
 * @param {Array} parsedDiff - Parsed diff objects
 * @param {Array} matchedDocSections - Matched documentation sections
 * @returns {string} Formatted prompt
 */
function constructPrompt(parsedDiff, matchedDocSections) {
  const lines = [];
  
  lines.push('You are a documentation accuracy checker.');
  lines.push('');
  lines.push('CODE CHANGES:');
  lines.push('');
  
  // Add code changes summary
  for (const change of parsedDiff) {
    lines.push(`File: ${change.file}`);
    lines.push(`Summary: ${change.summary}`);
    
    if (change.changedFunctions.length > 0) {
      lines.push(`Changed Functions: ${change.changedFunctions.join(', ')}`);
    }
    
    lines.push(`Added Lines: ${change.addedLines.length}`);
    lines.push(`Removed Lines: ${change.removedLines.length}`);
    
    // Show some actual changed lines for context
    if (change.addedLines.length > 0) {
      lines.push('');
      lines.push('Added:');
      change.addedLines.slice(0, 5).forEach(line => {
        lines.push(`  + ${line}`);
      });
      if (change.addedLines.length > 5) {
        lines.push(`  ... and ${change.addedLines.length - 5} more`);
      }
    }
    
    if (change.removedLines.length > 0) {
      lines.push('');
      lines.push('Removed:');
      change.removedLines.slice(0, 5).forEach(line => {
        lines.push(`  - ${line}`);
      });
      if (change.removedLines.length > 5) {
        lines.push(`  ... and ${change.removedLines.length - 5} more`);
      }
    }
    
    lines.push('');
  }
  
  lines.push('DOCUMENTATION TO CHECK:');
  lines.push('');
  
  // Add matched documentation sections
  if (matchedDocSections.length === 0) {
    lines.push('No documentation sections matched the changed files.');
  } else {
    // Group by document
    const byDoc = {};
    for (const section of matchedDocSections) {
      if (!byDoc[section.docPath]) {
        byDoc[section.docPath] = [];
      }
      byDoc[section.docPath].push(section);
    }
    
    for (const [docPath, sections] of Object.entries(byDoc)) {
      lines.push(`Document: ${docPath}`);
      lines.push('Sections to review:');
      for (const section of sections) {
        lines.push(`  - "${section.section}" (lines ${section.startLine}-${section.endLine})`);
        lines.push(`    Matched keyword: "${section.keyword}"`);
      }
      lines.push('');
    }
  }
  
  lines.push('TASK: Identify which documentation sections are now outdated or incorrect');
  lines.push('based on the code changes. For each stale section, provide:');
  lines.push('- file: which doc file');
  lines.push('- line: approximate line number');
  lines.push('- issue: what is wrong');
  lines.push('- suggestion: the corrected text');
  lines.push('');
  lines.push('Respond in JSON format only.');
  
  return lines.join('\n');
}

/**
 * Named export for backward compatibility
 */
export { analyzeWithBob };

// Made with Bob
