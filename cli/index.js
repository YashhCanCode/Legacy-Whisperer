#!/usr/bin/env node

/**
 * DocSync - Pre-commit Git Hook
 * 
 * This script runs as a pre-commit hook to:
 * 1. Get git diff of all staged files
 * 2. Filter only changed .js and .ts files
 * 3. Find all .md files in the repo
 * 4. Log the changed files and found docs (placeholder for AI analysis)
 * 5. Exit with code 0 to allow the commit
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import parseDiff from './diff-parser.js';
import scanDocs from './doc-scanner.js';
import analyzeWithBob from './bob-bridge.js';

/**
 * Get staged files from git diff
 * @returns {string[]} Array of staged file paths
 */
function getStagedFiles() {
  try {
    // Use git diff-index which is the proper way to get staged files in hooks
    const diff = execSync('git diff-index --cached HEAD --name-only', { encoding: 'utf-8' });
    return diff.trim().split('\n').filter(Boolean);
  } catch (error) {
    // If not in a git repo or no HEAD yet, return empty array
    return [];
  }
}

/**
 * Filter files by extensions
 * @param {string[]} files - Array of file paths
 * @param {string[]} extensions - Array of extensions to filter (e.g., ['.js', '.ts'])
 * @returns {string[]} Filtered files
 */
function filterByExtension(files, extensions) {
  return files.filter(file => extensions.includes(extname(file)));
}

/**
 * Recursively find all files with specific extensions in a directory
 * @param {string} dir - Directory to search
 * @param {string[]} extensions - Extensions to match
 * @returns {string[]} Array of matching file paths
 */
function findFilesByExtension(dir, extensions) {
  let results = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      
      try {
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, .git, and other common directories
          if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry)) {
            results = results.concat(findFilesByExtension(fullPath, extensions));
          }
        } else if (stat.isFile() && extensions.includes(extname(entry))) {
          results.push(fullPath);
        }
      } catch (err) {
        // Skip files/dirs we can't access
        continue;
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return results;
}

/**
 * Extract keywords from a filename
 * @param {string} filename - File name (e.g., "auth.js" or "userAuth.js")
 * @returns {string[]} Array of keywords
 */
function extractKeywords(filename) {
  // Remove extension
  const nameWithoutExt = basename(filename, extname(filename));
  
  // Split camelCase and PascalCase into words
  // e.g., "userAuth" -> ["user", "auth"]
  const words = nameWithoutExt
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2') // PascalCase
    .toLowerCase()
    .split(/[_\-\s]+/) // Split on underscore, dash, or space
    .filter(Boolean);
  
  return words;
}

/**
 * Find documentation sections that match keywords and code changes
 * @param {Array} docs - Array of documentation objects from scanDocs
 * @param {string[]} keywords - Keywords to search for
 * @param {Array} parsedChanges - Parsed diff changes with added/removed lines
 * @returns {Array} Matching sections with doc path, section info, and match type
 */
function findMatchingSections(docs, keywords, parsedChanges = []) {
  const allMatches = [];
  
  // Extract added and removed line content for exact matching
  const changedContent = [];
  for (const change of parsedChanges) {
    changedContent.push(...change.addedLines);
    changedContent.push(...change.removedLines);
  }
  
  for (const doc of docs) {
    const docMatches = [];
    
    for (const section of doc.sections) {
      const headingLower = section.heading.toLowerCase();
      const contentLower = section.content.toLowerCase();
      let matchType = null;
      let matchedKeyword = null;
      let confidence = 0;
      
      // Priority 1: High confidence - exact content match
      for (const line of changedContent) {
        const lineLower = line.trim().toLowerCase();
        if (lineLower.length > 10 && contentLower.includes(lineLower)) {
          matchType = 'High confidence match';
          confidence = 3;
          matchedKeyword = line.substring(0, 50) + (line.length > 50 ? '...' : '');
          break;
        }
      }
      
      // Priority 2: Heading match
      if (!matchType) {
        for (const keyword of keywords) {
          if (headingLower.includes(keyword.toLowerCase())) {
            matchType = 'Heading match';
            confidence = 2;
            matchedKeyword = keyword;
            break;
          }
        }
      }
      
      // Priority 3: Content match (only if keyword is substantial)
      if (!matchType) {
        for (const keyword of keywords) {
          if (keyword.length >= 4 && contentLower.includes(keyword.toLowerCase())) {
            matchType = 'Content match';
            confidence = 1;
            matchedKeyword = keyword;
            break;
          }
        }
      }
      
      if (matchType) {
        docMatches.push({
          docPath: doc.path,
          section: section.heading,
          startLine: section.startLine,
          endLine: section.endLine,
          keyword: matchedKeyword,
          matchType: matchType,
          confidence: confidence
        });
      }
    }
    
    // Sort by confidence (highest first) and take top 5 per document
    docMatches.sort((a, b) => b.confidence - a.confidence);
    allMatches.push(...docMatches.slice(0, 5));
  }
  
  return allMatches;
}

/**
 * Main function - runs the pre-commit hook logic
 */
async function main() {
  console.log('🔍 DocSync Pre-commit Hook\n');

  // Step 1: Get staged files
  console.log('📊 Getting staged files...');
  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log('   No staged files found.');
    process.exit(0);
  }
  
  console.log(`   Found ${stagedFiles.length} staged file(s)`);

  // Step 2: Filter for .js and .ts files
  console.log('\n🔎 Filtering for .js and .ts files...');
  const changedCodeFiles = filterByExtension(stagedFiles, ['.js', '.ts']);
  
  if (changedCodeFiles.length === 0) {
    console.log('   No .js or .ts files changed.');
    console.log('\n✅ Commit allowed (no code changes to analyze)');
    process.exit(0);
  }
  
  console.log(`   Found ${changedCodeFiles.length} changed code file(s):`);
  changedCodeFiles.forEach(file => console.log(`   - ${file}`));

  // Step 3: Find all .md files in the repo
  console.log('\n📄 Scanning for .md documentation files...');
  const docFiles = findFilesByExtension(process.cwd(), ['.md']);
  console.log(`   Found ${docFiles.length} documentation file(s):`);
  docFiles.forEach(file => console.log(`   - ${file}`));

  // Step 4: Get full diff and parse it
  console.log('\n📝 Analyzing code changes...');
  let parsedChanges = [];
  try {
    const rawDiff = execSync('git diff --cached', { encoding: 'utf-8' });
    
    if (!rawDiff.trim()) {
      console.log('   No diff content available.');
    } else {
      parsedChanges = parseDiff(rawDiff);
      
      if (parsedChanges.length === 0) {
        console.log('   No parseable changes found.');
      } else {
        console.log(`   Parsed ${parsedChanges.length} file(s) with changes:\n`);
        
        for (const change of parsedChanges) {
          console.log(`   📄 ${change.file}`);
          
          if (change.changedFunctions.length > 0) {
            console.log(`      Functions: ${change.changedFunctions.join(', ')}`);
          }
          
          console.log(`      Added: ${change.addedLines.length} line(s)`);
          console.log(`      Removed: ${change.removedLines.length} line(s)`);
          console.log(`      Summary: ${change.summary}`);
          console.log();
        }
      }
    }
  } catch (error) {
    console.log('   Could not parse diff:', error.message);
  }

  // Step 5: Scan and parse documentation files
  console.log('📚 Scanning documentation structure...');
  const docs = scanDocs(process.cwd());
  
  if (docs.length === 0) {
    console.log('   No documentation files found.');
  } else {
    console.log(`   Scanned ${docs.length} documentation file(s):\n`);
    
    for (const doc of docs) {
      console.log(`   📄 ${doc.path}`);
      console.log(`      Sections: ${doc.sections.length}`);
      if (doc.sections.length > 0) {
        console.log(`      Headings: ${doc.sections.map(s => s.heading).join(', ')}`);
      }
      console.log();
    }
  }

  // Step 6: Match changed files to related documentation sections
  console.log('🔗 Finding related documentation sections...');
  
  const allMatches = [];
  for (const changedFile of changedCodeFiles) {
    const keywords = extractKeywords(changedFile);
    console.log(`\n   📄 ${changedFile}`);
    console.log(`      Keywords: ${keywords.join(', ')}`);
    
    const matches = findMatchingSections(docs, keywords, parsedChanges);
    
    if (matches.length > 0) {
      console.log(`      Found ${matches.length} relevant section(s):`);
      for (const match of matches) {
        console.log(`         • ${match.docPath} - "${match.section}" (lines ${match.startLine}-${match.endLine})`);
        console.log(`           ${match.matchType}: "${match.keyword}"`);
      }
      allMatches.push(...matches);
    } else {
      console.log(`      No related documentation sections found.`);
    }
  }

  // Step 7: Generate Bob analysis prompt
  if (parsedChanges.length > 0 && allMatches.length > 0) {
    console.log('\n🤖 Generating AI analysis prompt...');
    
    try {
      const prompt = analyzeWithBob(parsedChanges, allMatches);
      
      console.log('   ✅ Analysis files created:');
      console.log('      • /tmp/docsync-analysis.txt (prompt for Bob)');
      console.log('      • /tmp/docsync-input.json (structured data)');
      console.log('\n   📋 Prompt preview (first 500 chars):');
      console.log('   ' + '─'.repeat(70));
      console.log('   ' + prompt.substring(0, 500).split('\n').join('\n   '));
      if (prompt.length > 500) {
        console.log('   ...');
      }
      console.log('   ' + '─'.repeat(70));
      console.log('\n   💡 Copy /tmp/docsync-analysis.txt and paste into Bob for analysis!');
    } catch (error) {
      console.log('   ⚠️  Could not generate analysis prompt:', error.message);
    }
  }

  // Step 8: Summary
  if (allMatches.length > 0) {
    console.log(`\n⚠️  Found ${allMatches.length} documentation section(s) that may need review.`);
  } else {
    console.log(`\n✅ No documentation sections matched the changed files.`);
  }

  // Step 9: Exit with code 0 to allow commit
  console.log('\n✅ Pre-commit hook complete. Commit allowed.');
  process.exit(0);
}

// Run the hook
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(0); // Still allow commit even if hook fails
});

// Made with Bob
