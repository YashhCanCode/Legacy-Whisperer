import React, { useState } from 'react'

const DocViewer = ({ file, onLineSelect }) => {
  const [hoveredLine, setHoveredLine] = useState(null)
  const [selectedLine, setSelectedLine] = useState(null)

  if (!file) {
    return (
      <div className="h-full bg-dark-bg flex items-center justify-center">
        <div className="text-center text-dark-muted">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-sm">Select a file to view its content</p>
        </div>
      </div>
    )
  }

  // Split content into lines
  const lines = file.content ? file.content.split('\n') : []

  // Create a map of line numbers to issues for quick lookup
  const issueMap = new Map()
  if (file.issues && Array.isArray(file.issues)) {
    file.issues.forEach(issue => {
      issueMap.set(issue.line, issue)
    })
  }

  const handleLineClick = (lineNumber) => {
    const issue = issueMap.get(lineNumber)
    if (issue) {
      setSelectedLine(lineNumber)
      if (onLineSelect) {
        onLineSelect({ lineNumber, issue })
      }
    }
  }

  return (
    <div className="h-full bg-dark-bg flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-dark-border bg-dark-surface">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📄</span>
          <div>
            <h2 className="text-lg font-semibold text-dark-text font-mono">
              {file.name}
            </h2>
            {file.issues && file.issues.length > 0 && (
              <p className="text-xs text-dark-muted mt-1">
                {file.issues.length} issue{file.issues.length !== 1 ? 's' : ''} detected
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Area - Code Editor Style */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full">
          {lines.length === 0 ? (
            <div className="p-6 text-center text-dark-muted text-sm">
              No content to display
            </div>
          ) : (
            <div className="font-mono text-sm">
              {lines.map((line, index) => {
                const lineNumber = index + 1
                const issue = issueMap.get(lineNumber)
                const hasIssue = !!issue
                const isSelected = selectedLine === lineNumber
                const isHovered = hoveredLine === lineNumber

                return (
                  <div
                    key={lineNumber}
                    className={`
                      flex group relative
                      ${hasIssue ? 'bg-[#3d1515] cursor-pointer hover:bg-[#4d1f1f]' : ''}
                      ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                      transition-colors
                    `}
                    onClick={() => handleLineClick(lineNumber)}
                    onMouseEnter={() => setHoveredLine(lineNumber)}
                    onMouseLeave={() => setHoveredLine(null)}
                  >
                    {/* Line Number */}
                    <div 
                      className={`
                        flex-shrink-0 w-16 px-4 py-1 text-right select-none
                        ${hasIssue ? 'text-red-400' : 'text-dark-muted'}
                        ${isSelected ? 'text-blue-400 font-bold' : ''}
                      `}
                    >
                      {lineNumber}
                    </div>

                    {/* Line Content */}
                    <div className="flex-1 px-4 py-1 text-dark-text whitespace-pre-wrap break-words">
                      {line || ' '}
                      
                      {/* Warning Icon for Issues */}
                      {hasIssue && (
                        <span className="ml-2 text-yellow-400 inline-flex items-center">
                          ⚠️
                        </span>
                      )}
                    </div>

                    {/* Tooltip on Hover */}
                    {hasIssue && isHovered && (
                      <div className="absolute left-20 top-full mt-1 z-10 w-96 p-3 bg-dark-surface border border-dark-border rounded-lg shadow-xl">
                        <div className="text-xs space-y-2">
                          <div>
                            <div className="text-red-400 font-semibold mb-1">
                              ⚠️ Issue Detected
                            </div>
                            <div className="text-dark-text">
                              {issue.issue}
                            </div>
                          </div>
                          {issue.suggestion && (
                            <div>
                              <div className="text-green-400 font-semibold mb-1">
                                💡 Suggestion
                              </div>
                              <div className="text-dark-muted">
                                {issue.suggestion}
                              </div>
                            </div>
                          )}
                          <div className="text-dark-muted italic pt-2 border-t border-dark-border">
                            Click to view in Analysis Panel
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-dark-border bg-dark-surface">
        <div className="flex items-center justify-between text-xs text-dark-muted">
          <div className="flex items-center space-x-4">
            <span>{lines.length} lines</span>
            {file.issues && file.issues.length > 0 && (
              <span className="text-red-400">
                {file.issues.length} issue{file.issues.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span>Plain Text</span>
            <span>•</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocViewer

// Made with Bob
