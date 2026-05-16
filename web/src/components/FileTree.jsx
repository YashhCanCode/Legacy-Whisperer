import React, { useState } from 'react'

const FileTree = ({ files = [], onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileClick = (file) => {
    setSelectedFile(file.path)
    if (onFileSelect) {
      onFileSelect(file)
    }
  }

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'critical':
        return <div className="w-2 h-2 rounded-full bg-red-500" title="Critical - Has issues" />
      case 'stale':
        return <div className="w-2 h-2 rounded-full bg-yellow-500" title="Stale - Needs analysis" />
      case 'healthy':
        return <div className="w-2 h-2 rounded-full bg-green-500" title="Healthy" />
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-500" />
    }
  }

  return (
    <div className="h-full bg-dark-surface flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <h2 className="text-base font-semibold text-dark-text flex items-center space-x-2">
          <span>📁</span>
          <span>Documentation Files</span>
        </h2>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="p-4 text-center text-dark-muted text-sm">
            No files to display
          </div>
        ) : (
          <div className="p-2">
            {files.map((file) => (
              <div
                key={file.path}
                onClick={() => handleFileClick(file)}
                className={`
                  relative group cursor-pointer rounded-lg mb-1 transition-all
                  ${selectedFile === file.path 
                    ? 'bg-dark-bg border-l-4 border-blue-500 pl-3' 
                    : 'hover:bg-dark-bg pl-4'
                  }
                `}
              >
                <div className="flex items-center justify-between p-3">
                  {/* Left side: Status dot + filename */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getStatusIndicator(file.status)}
                    <span className="text-sm font-mono text-dark-text truncate">
                      {file.name}
                    </span>
                  </div>

                  {/* Right side: Issue count badge (only for critical) */}
                  {file.status === 'critical' && file.issueCount > 0 && (
                    <div className="flex-shrink-0 ml-2">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        {file.issueCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-dark-border bg-dark-bg">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-dark-muted">
            <span>Total files:</span>
            <span className="font-semibold text-dark-text">{files.length}</span>
          </div>
          <div className="flex items-center justify-between text-dark-muted">
            <span className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>Critical:</span>
            </span>
            <span className="font-semibold text-red-400">
              {files.filter(f => f.status === 'critical').length}
            </span>
          </div>
          <div className="flex items-center justify-between text-dark-muted">
            <span className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              <span>Stale:</span>
            </span>
            <span className="font-semibold text-yellow-400">
              {files.filter(f => f.status === 'stale').length}
            </span>
          </div>
          <div className="flex items-center justify-between text-dark-muted">
            <span className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Healthy:</span>
            </span>
            <span className="font-semibold text-green-400">
              {files.filter(f => f.status === 'healthy').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileTree

// Made with Bob
