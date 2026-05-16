#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Parse Bob's raw output and normalize it into our format
 * @param {string} rawText - Raw text from Bob (could be JSON or markdown with JSON)
 * @returns {Array} Normalized array of issues
 */
export function parseBobResult(rawText) {
  let parsedData = null;

  // Step 1: Try to parse as direct JSON
  try {
    parsedData = JSON.parse(rawText);
  } catch (e) {
    // Step 2: Extract JSON from markdown code blocks
    const jsonMatch = rawText.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[1]);
      } catch (e2) {
        console.error('Failed to parse JSON from code block:', e2.message);
        return [];
      }
    } else {
      console.error('No valid JSON found in input');
      return [];
    }
  }

  // Step 3: Normalize the result
  const normalized = [];

  // Handle different possible formats from Bob
  const issues = parsedData.staleDocumentation || 
                 parsedData.outdatedSections || 
                 parsedData.issues ||
                 parsedData;

  if (!Array.isArray(issues)) {
    console.error('Expected array of issues, got:', typeof issues);
    return [];
  }

  for (const issue of issues) {
    // Normalize field names
    const normalizedIssue = {
      file: issue.file || issue.docPath || issue.path || 'unknown',
      line: issue.line || issue.lineNumber || 0,
      issue: issue.issue || issue.description || issue.problem || '',
      oldText: issue.oldText || issue.currentText || issue.original || '',
      suggestion: issue.suggestion || issue.newText || issue.fix || ''
    };

    // Only add if we have at least a file and issue description
    if (normalizedIssue.file && normalizedIssue.issue) {
      normalized.push(normalizedIssue);
    }
  }

  // Step 4: Write to /tmp/docsync-result.json
  const outputPath = '/tmp/docsync-result.json';
  try {
    fs.writeFileSync(outputPath, JSON.stringify({ outdatedSections: normalized }, null, 2));
    console.log(`✅ Parsed ${normalized.length} issue(s) and saved to ${outputPath}`);
  } catch (error) {
    console.error('Failed to write result file:', error.message);
  }

  // Step 5: Return the normalized array
  return normalized;
}

/**
 * Extract old text from documentation sections if available
 * This is a helper to enrich the result with context from the input
 * @param {Array} issues - Normalized issues
 * @param {string} inputPath - Path to docsync-input.json
 * @returns {Array} Issues with oldText filled in
 */
export function enrichWithContext(issues, inputPath = '/tmp/docsync-input.json') {
  try {
    const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    const sections = inputData.documentationSections || [];

    for (const issue of issues) {
      if (!issue.oldText) {
        // Find matching section
        const matchingSection = sections.find(s => 
          s.docPath === issue.file && 
          issue.line >= s.startLine && 
          issue.line <= s.endLine
        );

        if (matchingSection) {
          // Extract the specific line from the section content
          const lines = matchingSection.content.split('\n');
          const lineIndex = issue.line - matchingSection.startLine;
          if (lineIndex >= 0 && lineIndex < lines.length) {
            issue.oldText = lines[lineIndex];
          }
        }
      }
    }
  } catch (error) {
    console.warn('Could not enrich with context:', error.message);
  }

  return issues;
}

// CLI runner - can be called directly from command line
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const inputFile = process.argv[2] || '/tmp/bob-raw-output.txt';
  
  try {
    console.log(`📖 Reading Bob's output from ${inputFile}...`);
    const rawText = fs.readFileSync(inputFile, 'utf8');
    
    console.log('🔍 Parsing result...');
    let issues = parseBobResult(rawText);
    
    console.log('📝 Enriching with context...');
    issues = enrichWithContext(issues);
    
    // Update the result file with enriched data
    fs.writeFileSync('/tmp/docsync-result.json', JSON.stringify({ outdatedSections: issues }, null, 2));
    
    console.log('✅ Result parsed and saved to /tmp/docsync-result.json');
    console.log(`   Found ${issues.length} outdated section(s)`);
    
    // Print summary
    if (issues.length > 0) {
      console.log('\n📋 Summary:');
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue.file}:${issue.line} - ${issue.issue}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Made with Bob
