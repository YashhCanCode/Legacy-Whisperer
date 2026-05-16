/**
 * Documentation Scanner Module
 * 
 * Recursively scans a repository directory for markdown documentation files,
 * reads their content, and parses them into structured sections.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

/**
 * Scan a repository for markdown documentation files
 * @param {string} repoPath - Path to the repository root
 * @returns {Array<Object>} Array of documentation file objects
 */
export default function scanDocs(repoPath) {
  const docFiles = [];
  const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out'];

  /**
   * Recursively walk directory tree
   * @param {string} dir - Current directory path
   */
  function walkDirectory(dir) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (!excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
            walkDirectory(fullPath);
          }
        } else if (entry.isFile() && isMarkdownFile(entry.name)) {
          // Process markdown file
          try {
            const content = readFileSync(fullPath, 'utf-8');
            const relativePath = relative(repoPath, fullPath);
            const sections = parseSections(content);

            docFiles.push({
              path: relativePath,
              content: content,
              sections: sections
            });
          } catch (error) {
            console.warn(`Warning: Could not read file ${fullPath}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dir}: ${error.message}`);
    }
  }

  walkDirectory(repoPath);
  return docFiles;
}

/**
 * Check if a file is a markdown file
 * @param {string} filename - Name of the file
 * @returns {boolean} True if it's a markdown file
 */
function isMarkdownFile(filename) {
  return filename.endsWith('.md') || filename.endsWith('.markdown');
}

/**
 * Parse markdown content into sections based on headings
 * @param {string} content - Full markdown file content
 * @returns {Array<Object>} Array of section objects
 */
function parseSections(content) {
  const sections = [];
  const lines = content.split('\n');
  
  let currentSection = null;
  let currentLines = [];
  let currentStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match markdown headings (## or ### or more)
    // We look for level 2+ headings (##, ###, etc.)
    const headingMatch = line.match(/^(#{2,})\s+(.+)$/);
    
    if (headingMatch) {
      // Save previous section if it exists
      if (currentSection) {
        sections.push({
          heading: currentSection.heading,
          startLine: currentSection.startLine,
          endLine: i - 1,
          content: currentLines.join('\n').trim()
        });
      }

      // Start new section
      currentSection = {
        heading: headingMatch[2].trim(),
        startLine: i + 1  // Content starts on next line
      };
      currentLines = [];
    } else if (currentSection) {
      // Add line to current section content
      currentLines.push(line);
    }
  }

  // Add the last section if it exists
  if (currentSection) {
    sections.push({
      heading: currentSection.heading,
      startLine: currentSection.startLine,
      endLine: lines.length - 1,
      content: currentLines.join('\n').trim()
    });
  }

  return sections;
}

/**
 * Named export for backward compatibility
 */
export { scanDocs };

// Made with Bob
