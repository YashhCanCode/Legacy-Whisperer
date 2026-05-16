import React, { useState, useEffect, useRef } from 'react'
import FileTree from './components/FileTree'
import DocViewer from './components/DocViewer'
import AnalysisPanel from './components/AnalysisPanel'

const API_BASE = 'http://localhost:3001/api'

// Hardcoded file contents as fallback
const fileContents = {
  "README.md": `# Demo Repository - JWT Authentication Service

A production-ready Express.js authentication service with JWT token management and MongoDB integration.

## Overview

This repository demonstrates a secure, scalable authentication system built with modern Node.js practices. It provides JWT-based authentication, role-based access control, and MongoDB database connectivity.

## Features

- 🔐 JWT-based authentication with secure token generation
- 👥 Role-based access control (RBAC)
- 🗄️ MongoDB integration with Mongoose ODM
- ⚡ Express.js middleware for route protection
- 🏥 Health check endpoints for monitoring
- 🔄 Token refresh mechanism

## Authentication Flow

Tokens expire after 1 hour for security purposes. Users must refresh their tokens or re-authenticate after expiration.

### 1. User Login

Users authenticate with email and password to receive a JWT token:

\`\`\`javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
\`\`\`

Response includes a JWT token valid for 1 hour.

### 2. Authenticated Requests

Include the JWT token in the Authorization header for protected routes:

\`\`\`javascript
Authorization: Bearer <your-jwt-token>
\`\`\`

### 3. Token Refresh

Before token expiration, users can refresh their token to maintain their session:

\`\`\`javascript
POST /api/auth/refresh
Authorization: Bearer <current-token>
\`\`\`

### 4. Role-Based Access Control

Endpoints can be protected by user roles (admin, user, etc.):

\`\`\`javascript
app.get('/admin/users', authMiddleware, requireRole(['admin']), handler);
\`\`\`

## Security Considerations

- JWT secret should be stored in environment variables
- Tokens expire after 1 hour to minimize security risks
- HTTPS should be used in production
- Implement rate limiting on authentication endpoints
- Consider token blacklisting for logout functionality

## Database Connection

The application uses MongoDB with Mongoose for data persistence:

- Automatic reconnection on connection loss
- Connection pooling for performance
- Health check endpoint for monitoring
- Graceful shutdown handling

## Getting Started

### Prerequisites

- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

### Installation

\`\`\`bash
npm install
\`\`\`

### Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production

# Database Configuration
DB_HOST=localhost
DB_PORT=27017
DB_NAME=docsync_demo
\`\`\`

### Running the Application

\`\`\`bash
# Development mode
npm run dev

# Production mode
npm start
\`\`\`

## API Endpoints

See [API.md](./API.md) for detailed API documentation.

## Testing

\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
\`\`\`

## License

MIT License - see LICENSE file for details

// Made with Bob`,
  
  "API.md": `# API Documentation

This document describes the available API endpoints for the Demo Repository application.

## Base URL

\`\`\`
http://localhost:3000/api
\`\`\`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the \`Authorization\` header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

---

## Endpoints

### 1. User Login

Authenticate a user and receive a JWT token.

**Endpoint**: \`POST /api/auth/login\`

**Authentication**: Not required

**Request Body**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Success Response** (200 OK):
\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1h",
  "user": {
    "id": "12345",
    "email": "user@example.com",
    "role": "user"
  }
}
\`\`\`

**Error Responses**:

- **400 Bad Request**: Missing email or password
  \`\`\`json
  {
    "error": "Bad Request",
    "message": "Email and password are required"
  }
  \`\`\`

- **401 Unauthorized**: Invalid credentials
  \`\`\`json
  {
    "error": "Unauthorized",
    "message": "Invalid email or password"
  }
  \`\`\`

**Notes**:
- Token expires after 1 hour
- In this demo, any email/password combination is accepted

---

### 2. Refresh Token

Get a new JWT token using a valid existing token.

**Endpoint**: \`POST /api/auth/refresh\`

**Authentication**: Required

**Request Headers**:
\`\`\`
Authorization: Bearer <current-valid-token>
\`\`\`

**Success Response** (200 OK):
\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1h"
}
\`\`\`

**Error Responses**:

- **401 Unauthorized**: No token provided
  \`\`\`json
  {
    "error": "Unauthorized",
    "message": "No token provided"
  }
  \`\`\`

- **401 Unauthorized**: Invalid or expired token
  \`\`\`json
  {
    "error": "Unauthorized",
    "message": "Invalid or expired token"
  }
  \`\`\`

**Notes**:
- The new token has a fresh 1-hour expiration
- Use this endpoint to maintain user sessions without re-login

---

### 3. User Logout

Logout the current user (client-side token removal).

**Endpoint**: \`POST /api/auth/logout\`

**Authentication**: Optional (recommended)

**Success Response** (200 OK):
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

**Notes**:
- In JWT-based authentication, logout is primarily handled client-side
- The client should remove/invalidate the stored token
- This endpoint is provided for consistency and potential server-side logging

---

## Error Handling

All endpoints follow a consistent error response format:

\`\`\`json
{
  "error": "ErrorType",
  "message": "Human-readable error description"
}
\`\`\`

### Common HTTP Status Codes

- **200 OK**: Request succeeded
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service temporarily unavailable

---

## Examples

### Login Example (cURL)

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
\`\`\`

### Authenticated Request Example (cURL)

\`\`\`bash
curl -X GET http://localhost:3000/api/users \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
\`\`\`

---

## Support

For issues or questions, please open an issue on the GitHub repository.

// Made with Bob`
}

function App() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastAnalyzed, setLastAnalyzed] = useState('just now')
  const [showModal, setShowModal] = useState(false)
  const [parsing, setParsing] = useState(false)
  
  // Track accepted fixes to prevent polling from re-adding them
  const acceptedFixes = useRef(new Set())

  // Fetch analysis data from backend
  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`${API_BASE}/analysis`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      
      // API now returns { files: [...], lastAnalyzed: "..." }
      // Filter out already-accepted fixes before setting state
      const filteredFiles = data.files.map(file => ({
        ...file,
        // Use fallback content if API returns empty string
        content: file.content || fileContents[file.name] || '',
        // Filter out accepted fixes
        issues: file.issues.filter(issue =>
          !acceptedFixes.current.has(`${file.name}:${issue.line}`)
        )
      })).map(file => ({
        ...file,
        // Recalculate issue count and status after filtering
        issueCount: file.issues.length,
        status: file.issues.length === 0 ? 'healthy' : 'critical'
      }))
      
      setFiles(filteredFiles)
      
      // Update timestamp
      if (data.lastAnalyzed) {
        updateLastAnalyzedTime(data.lastAnalyzed)
      }
      
      // Update selected file if it exists in new data
      if (selectedFile) {
        const updatedFile = filesWithContent.find(f => f.name === selectedFile.name)
        if (updatedFile) {
          setSelectedFile(updatedFile)
        } else {
          // File no longer exists, select first file
          setSelectedFile(filesWithContent[0] || null)
        }
      } else if (filesWithContent.length > 0) {
        // No file selected, select first one
        setSelectedFile(filesWithContent[0])
      }
      
      // Clear selected issue if it no longer exists
      if (selectedIssue && selectedFile) {
        const updatedFile = filesWithContent.find(f => f.name === selectedFile.name)
        if (updatedFile) {
          const issueStillExists = updatedFile.issues.some(i => i.line === selectedIssue.line)
          if (!issueStillExists) {
            setSelectedIssue(null)
          }
        }
      }
      
    } catch (error) {
      console.warn('Failed to fetch analysis:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Update last analyzed time display
  const updateLastAnalyzedTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) {
      setLastAnalyzed('just now')
    } else if (diffMins < 60) {
      setLastAnalyzed(`${diffMins} min${diffMins > 1 ? 's' : ''} ago`)
    } else {
      const diffHours = Math.floor(diffMins / 60)
      setLastAnalyzed(`${diffHours} hour${diffHours > 1 ? 's' : ''} ago`)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchAnalysis()
  }, [])

  // Poll for updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalysis()
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedFile, selectedIssue]) // Include dependencies to maintain state

  // Handle file selection from FileTree
  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setSelectedIssue(null)
  }

  // Handle line selection from DocViewer
  const handleLineSelect = ({ lineNumber, issue }) => {
    setSelectedIssue({
      ...issue,
      line: lineNumber
    })
  }

  // Handle accepting a fix
  const handleAcceptFix = async (issue) => {
    if (!selectedFile || !issue) return

    try {
      // 1. Add to accepted fixes set (prevents polling from re-adding)
      acceptedFixes.current.add(`${selectedFile.name}:${issue.line}`)
      
      // 2. Call the API to write the fix
      const response = await fetch(`${API_BASE}/apply-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docPath: selectedFile.path,
          lineNumber: issue.line,
          newText: issue.suggestion
        })
      })

      if (!response.ok) throw new Error('Failed to apply fix')

      // 3. Re-fetch the file content from the server
      const contentResponse = await fetch(`${API_BASE}/file-content?path=${selectedFile.name}`)
      if (!contentResponse.ok) throw new Error('Failed to fetch updated content')
      
      const contentData = await contentResponse.json()
      const updatedContent = contentData.content || fileContents[selectedFile.name] || ''

      // 4. Update local state with new content and filtered issues
      const updatedFiles = files.map(f => {
        if (f.name !== selectedFile.name) return f
        
        const remainingIssues = f.issues.filter(i => i.line !== issue.line)
        return {
          ...f,
          content: updatedContent, // Update with fresh content from server
          issues: remainingIssues,
          issueCount: remainingIssues.length,
          status: remainingIssues.length === 0 ? 'healthy' : 'critical'
        }
      })
      
      setFiles(updatedFiles)
      
      // Update selectedFile reference with new content
      const updatedSelectedFile = updatedFiles.find(f => f.name === selectedFile.name)
      setSelectedFile(updatedSelectedFile)
      
      // 5. Clear selected issue
      setSelectedIssue(null)
      
      // 6. Auto-select next issue if available
      if (updatedSelectedFile && updatedSelectedFile.issues.length > 0) {
        // Select the first remaining issue
        const nextIssue = updatedSelectedFile.issues[0]
        setTimeout(() => {
          setSelectedIssue(nextIssue)
        }, 100)
      }

      showToast(`✅ Fix applied to ${selectedFile.name}`)
      
    } catch (error) {
      showToast(`❌ Failed to apply fix: ${error.message}`)
    }
  }

  // Handle ignoring an issue
  const handleIgnore = () => {
    setSelectedIssue(null)
    showToast('Issue ignored')
  }

  // Handle Run Analysis button
  const handleRunAnalysis = () => {
    setShowModal(true)
  }

  // Handle parsing Bob's output
  const handleParseResults = async () => {
    setParsing(true)
    try {
      const response = await fetch(`${API_BASE}/parse`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to parse')
      }

      showToast(`✅ Results parsed successfully`)
      setShowModal(false)
      
      // Immediately refresh data
      await fetchAnalysis()
      
    } catch (error) {
      showToast(`❌ ${error.message}`)
    } finally {
      setParsing(false)
    }
  }

  // Show toast notification
  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔍</div>
          <p className="text-dark-muted">Loading DocSync...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-dark-bg text-dark-text">
      {/* Top Navbar */}
      <nav className="h-16 bg-dark-surface border-b border-dark-border flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🔍</span>
          <h1 className="text-xl font-bold text-dark-text">
            DocSync
          </h1>
        </div>

        {/* Center Info */}
        <div className="flex items-center space-x-2 text-sm text-dark-muted">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Last analyzed: {lastAnalyzed}</span>
        </div>

        {/* Run Analysis Button */}
        <button 
          onClick={handleRunAnalysis}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center space-x-2"
        >
          <span>▶️</span>
          <span>Run Analysis</span>
        </button>
      </nav>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - File Tree (25%) */}
        <div className="w-1/4 border-r border-dark-border overflow-hidden">
          <FileTree 
            files={files} 
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* Middle Column - Doc Viewer (45%) */}
        <div className="w-[45%] border-r border-dark-border overflow-hidden">
          <DocViewer 
            file={selectedFile}
            onLineSelect={handleLineSelect}
          />
        </div>

        {/* Right Column - Analysis Panel (30%) */}
        <div className="w-[30%] overflow-hidden">
          <AnalysisPanel 
            issue={selectedIssue}
            onAcceptFix={handleAcceptFix}
            onIgnore={handleIgnore}
          />
        </div>
      </div>

      {/* Bob Instructions Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark-surface border border-dark-border rounded-lg shadow-2xl max-w-2xl w-full mx-4 p-6">
            <h2 className="text-2xl font-bold text-dark-text mb-4 flex items-center space-x-2">
              <span>🤖</span>
              <span>Run Bob Analysis</span>
            </h2>
            
            <div className="space-y-4 text-dark-text">
              <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                <p className="text-sm font-semibold mb-2">Step 1: Copy the prompt</p>
                <code className="text-xs text-green-400 block bg-black/50 p-2 rounded">
                  cat /tmp/docsync-analysis.txt
                </code>
              </div>

              <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                <p className="text-sm font-semibold mb-2">Step 2: Paste into Bob</p>
                <p className="text-xs text-dark-muted">
                  Open Bob's chat and paste the entire prompt. Bob will analyze the code changes and documentation.
                </p>
              </div>

              <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                <p className="text-sm font-semibold mb-2">Step 3: Save Bob's response</p>
                <p className="text-xs text-dark-muted mb-2">
                  Copy Bob's JSON response and save it to:
                </p>
                <code className="text-xs text-green-400 block bg-black/50 p-2 rounded">
                  /tmp/bob-raw-output.txt
                </code>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                <p className="text-xs text-yellow-400">
                  💡 Tip: Bob's response can be in markdown format with ```json code blocks, or plain JSON. Both work!
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleParseResults}
                disabled={parsing}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-semibold
                  ${parsing 
                    ? 'bg-green-600 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                  }
                  text-white transition-colors flex items-center justify-center space-x-2
                `}
              >
                {parsing ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Done, Parse Results</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowModal(false)}
                disabled={parsing}
                className="px-4 py-3 bg-dark-bg hover:bg-dark-border text-dark-text rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-dark-surface border border-green-500/30 rounded-lg shadow-xl px-6 py-4 animate-slide-up z-50">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{toast.startsWith('❌') ? '❌' : '✅'}</span>
            <span className="text-sm font-medium text-dark-text">{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
