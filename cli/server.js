#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { applyFix } from './doc-updater.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read JSON file safely
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// Helper function to get file stats
function getFileStats(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats;
  } catch (error) {
    return null;
  }
}

// GET /api/analysis
// Returns files with their issues from docsync-result.json
app.get('/api/analysis', (req, res) => {
  const resultPath = '/tmp/docsync-result.json';
  const inputPath = '/tmp/docsync-input.json';
  
  const resultData = readJsonFile(resultPath);
  const inputData = readJsonFile(inputPath);
  
  // Get timestamp
  const inputStats = getFileStats(inputPath);
  const lastAnalyzed = inputStats ? inputStats.mtime.toISOString() : new Date().toISOString();
  
  // If no result file, return healthy files
  if (!resultData || !resultData.staleDocumentation) {
    return res.json({
      files: [
        {
          name: "README.md",
          path: "demo-repo/README.md",
          status: "healthy",
          issueCount: 0,
          issues: [],
          content: ""
        },
        {
          name: "API.md",
          path: "demo-repo/API.md",
          status: "healthy",
          issueCount: 0,
          issues: [],
          content: ""
        }
      ],
      lastAnalyzed: lastAnalyzed
    });
  }
  
  // Group issues by file
  const fileMap = new Map();
  const staleItems = resultData.staleDocumentation || [];
  
  staleItems.forEach(item => {
    const fileName = item.file;
    if (!fileMap.has(fileName)) {
      fileMap.set(fileName, {
        name: fileName,
        path: `demo-repo/${fileName}`,
        status: "critical",
        issueCount: 0,
        issues: [],
        content: ""
      });
    }
    
    const file = fileMap.get(fileName);
    file.issues.push({
      line: item.line,
      oldText: item.oldText || "",
      issue: item.issue,
      suggestion: item.suggestion
    });
    file.issueCount++;
  });
  
  // Read file contents if available
  fileMap.forEach((file, fileName) => {
    try {
      const fullPath = path.join(process.cwd(), 'demo-repo', fileName);
      if (fs.existsSync(fullPath)) {
        file.content = fs.readFileSync(fullPath, 'utf8');
      }
    } catch (error) {
      console.warn(`Could not read ${fileName}:`, error.message);
    }
  });
  
  // Add healthy files that have no issues
  const allFiles = ['README.md', 'API.md'];
  allFiles.forEach(fileName => {
    if (!fileMap.has(fileName)) {
      try {
        const fullPath = path.join(process.cwd(), 'demo-repo', fileName);
        let content = "";
        if (fs.existsSync(fullPath)) {
          content = fs.readFileSync(fullPath, 'utf8');
        }
        
        fileMap.set(fileName, {
          name: fileName,
          path: `demo-repo/${fileName}`,
          status: "healthy",
          issueCount: 0,
          issues: [],
          content: content
        });
      } catch (error) {
        console.warn(`Could not read ${fileName}:`, error.message);
      }
    }
  });
  
  res.json({
    files: Array.from(fileMap.values()),
    lastAnalyzed: lastAnalyzed
  });
});

// POST /api/apply-fix
// Applies a documentation fix
app.post('/api/apply-fix', async (req, res) => {
  const { docPath, lineNumber, newText } = req.body;
  const absolutePath = path.join('/Users/yash./Legacy Whisperer', docPath);

  // Validate input
  if (!docPath || !lineNumber || !newText) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: docPath, lineNumber, newText'
    });
  }

  try {
    // Apply the fix using doc-updater
    applyFix(absolutePath, lineNumber, newText);

    // Update /tmp/docsync-result.json to remove the fixed issue
    const resultPath = '/tmp/docsync-result.json';
    const resultData = readJsonFile(resultPath);
    
    if (resultData && resultData.staleDocumentation) {
      // Extract filename from path (e.g., "demo-repo/README.md" -> "README.md")
      const fileName = path.basename(docPath);
      
      // Filter out the fixed issue (match by file name AND line number)
      const updatedStaleDocumentation = resultData.staleDocumentation.filter(item => {
        return !(item.file === fileName && item.line === lineNumber);
      });
      
      // Write updated data back to file
      resultData.staleDocumentation = updatedStaleDocumentation;
      fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));
      
      console.log(`Removed issue from ${fileName}:${lineNumber} from result file`);
    }

    res.json({
      success: true,
      message: `Fix applied to ${path.basename(docPath)} at line ${lineNumber}`
    });
  } catch (error) {
    console.error('Error applying fix:', error);
    res.status(500).json({
      success: false,
      message: `Failed to apply fix: ${error.message}`
    });
  }
});

// POST /api/clear-results
// Clears the analysis results
app.post('/api/clear-results', (req, res) => {
  const resultPath = '/tmp/docsync-result.json';
  
  try {
    if (fs.existsSync(resultPath)) {
      fs.unlinkSync(resultPath);
      console.log('Cleared analysis results');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/parse
// Runs result-parser.js to parse Bob's output
app.post('/api/parse', async (req, res) => {
  const parserScriptPath = '/Users/yash./Legacy Whisperer/cli/result-parser.js';
  
  try {
    // Run the parser script
    console.log('Running result parser...');
    execSync(`node "${parserScriptPath}"`, {
      encoding: 'utf8',
      timeout: 10000 // 10 second timeout
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error running parser:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET /api/status
// Returns analysis status information
app.get('/api/status', (req, res) => {
  const inputPath = '/tmp/docsync-input.json';
  const resultPath = '/tmp/docsync-result.json';

  const inputStats = getFileStats(inputPath);
  const resultStats = getFileStats(resultPath);

  // If files exist, use their modification time
  let lastAnalyzed = null;
  let fileCount = 0;

  if (inputStats) {
    lastAnalyzed = inputStats.mtime.toISOString();
    
    // Try to read input file to get file count
    const inputData = readJsonFile(inputPath);
    if (inputData && inputData.documentationSections) {
      // Count unique doc paths
      const uniqueDocs = new Set(
        inputData.documentationSections.map(s => s.docPath)
      );
      fileCount = uniqueDocs.size;
    }
  }

  res.json({
    lastAnalyzed: lastAnalyzed || new Date().toISOString(),
    fileCount: fileCount || 2,
    hasRealData: !!inputStats && !!resultStats
  });
});

// GET /api/file-content
// Returns the content of a file from demo-repo
app.get('/api/file-content', (req, res) => {
  const fileName = req.query.path;
  
  if (!fileName) {
    return res.status(400).json({
      success: false,
      error: 'Missing path parameter'
    });
  }
  
  const basePath = '/Users/yash./Legacy Whisperer/demo-repo/';
  const fullPath = path.join(basePath, fileName);
  
  try {
    // Security check - ensure path is within demo-repo
    const resolvedPath = path.resolve(fullPath);
    const resolvedBase = path.resolve(basePath);
    
    if (!resolvedPath.startsWith(resolvedBase)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      res.json({ content });
    } else {
      res.json({ content: '' });
    }
  } catch (error) {
    console.error('Error reading file:', error);
    res.json({ content: '' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DocSync API',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DocSync API server running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   GET  /api/analysis - Get analysis data`);
  console.log(`   POST /api/apply-fix - Apply a documentation fix`);
  console.log(`   POST /api/parse - Parse Bob's output`);
  console.log(`   GET  /api/status - Get analysis status`);
  console.log(`   GET  /api/health - Health check`);
});

// Made with Bob
