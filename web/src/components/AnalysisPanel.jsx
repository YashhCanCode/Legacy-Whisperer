import React, { useState } from 'react'

const AnalysisPanel = ({ issue, onAcceptFix, onIgnore }) => {
  const [isAccepting, setIsAccepting] = useState(false)

  const handleAccept = async () => {
    setIsAccepting(true)
    if (onAcceptFix) {
      await onAcceptFix(issue)
    }
    // Reset after a brief moment to show feedback
    setTimeout(() => setIsAccepting(false), 1000)
  }

  const handleIgnore = () => {
    if (onIgnore) {
      onIgnore(issue)
    }
  }

  // Empty state when no issue is selected
  if (!issue) {
    return (
      <div className="h-full bg-dark-surface flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-sm">
          {/* DocSync Logo/Icon */}
          <div className="text-7xl animate-pulse">
            🤖
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-dark-text">
              Bob is Ready
            </h3>
            <p className="text-sm text-dark-muted leading-relaxed">
              Select a flagged line in the document viewer to review Bob's suggestion
            </p>
          </div>

          {/* Decorative hint */}
          <div className="pt-4 text-xs text-dark-muted/50 flex items-center justify-center space-x-2">
            <span>⚠️</span>
            <span>Look for warning icons</span>
            <span>⚠️</span>
          </div>
        </div>
      </div>
    )
  }

  // Issue view when an issue is selected
  return (
    <div className="h-full bg-dark-surface flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-dark-border">
        <h2 className="text-lg font-semibold text-dark-text flex items-center space-x-2">
          <span className="text-2xl">🤖</span>
          <span>Bob's Analysis</span>
        </h2>
        <p className="text-xs text-dark-muted mt-1">
          Line {issue.line}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Issue Description */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wide">
            Issue Found
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-300 leading-relaxed">
              {issue.issue}
            </p>
          </div>
        </div>

        {/* Diff View */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-dark-text uppercase tracking-wide">
            Suggested Change
          </div>
          
          <div className="border border-dark-border rounded-lg overflow-hidden font-mono text-sm">
            {/* Old Text (Before) */}
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4">
              <div className="flex items-start space-x-3">
                <span className="text-red-400 font-bold flex-shrink-0">−</span>
                <span className="text-red-300 flex-1 whitespace-pre-wrap break-words">
                  {issue.oldText}
                </span>
              </div>
            </div>

            {/* New Text (After) */}
            <div className="bg-green-500/10 border-l-4 border-green-500 p-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold flex-shrink-0">+</span>
                <span className="text-green-300 flex-1 whitespace-pre-wrap break-words">
                  {issue.suggestion}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Indicator */}
        <div className="flex items-center space-x-2 text-xs text-dark-muted">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <span>High confidence suggestion</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-dark-border space-y-3">
        {/* Accept Button */}
        <button
          onClick={handleAccept}
          disabled={isAccepting}
          className={`
            w-full py-4 px-6 rounded-lg font-semibold text-base
            transition-all duration-200 transform
            ${isAccepting 
              ? 'bg-green-600 scale-95 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 hover:scale-105 active:scale-95'
            }
            text-white shadow-lg hover:shadow-xl
            flex items-center justify-center space-x-2
          `}
        >
          {isAccepting ? (
            <>
              <span className="animate-spin">⚙️</span>
              <span>Applying Fix...</span>
            </>
          ) : (
            <>
              <span>✅</span>
              <span>Accept Fix</span>
            </>
          )}
        </button>

        {/* Ignore Button */}
        <button
          onClick={handleIgnore}
          disabled={isAccepting}
          className="
            w-full py-2 px-4 rounded-lg font-medium text-sm
            bg-dark-bg hover:bg-dark-border
            text-dark-muted hover:text-dark-text
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          Ignore
        </button>

        {/* Helper Text */}
        <p className="text-xs text-center text-dark-muted/70 pt-2">
          Accepting will update the documentation file
        </p>
      </div>
    </div>
  )
}

export default AnalysisPanel

// Made with Bob
