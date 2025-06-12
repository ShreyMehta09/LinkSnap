'use client'

import { useState } from 'react'

interface BulkResult {
  originalUrl: string
  shortCode: string
  success: boolean
  error?: string
}

export default function BulkShortener() {
  const [urls, setUrls] = useState('')
  const [results, setResults] = useState<BulkResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleBulkShorten = async () => {
    const urlList = urls.split('\n').filter(url => url.trim())
    
    if (urlList.length === 0) {
      return
    }

    setIsProcessing(true)
    setResults([])

    const bulkResults: BulkResult[] = []

    for (const url of urlList) {
      try {
        const response = await fetch('/api/shorten', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ url: url.trim() }),
        })

        if (response.ok) {
          const data = await response.json()
          bulkResults.push({
            originalUrl: url.trim(),
            shortCode: data.shortCode,
            success: true
          })
        } else {
          const errorData = await response.json()
          bulkResults.push({
            originalUrl: url.trim(),
            shortCode: '',
            success: false,
            error: errorData.error || 'Failed to shorten URL'
          })
        }
      } catch (error) {
        bulkResults.push({
          originalUrl: url.trim(),
          shortCode: '',
          success: false,
          error: 'Network error'
        })
      }
    }

    setResults(bulkResults)
    setIsProcessing(false)
  }

  const copyAllResults = () => {
    const successfulResults = results
      .filter(result => result.success)
      .map(result => `${result.originalUrl} -> ${window.location.origin}/${result.shortCode}`)
      .join('\n')
    
    navigator.clipboard.writeText(successfulResults)
  }

  const downloadResults = () => {
    const csvContent = [
      'Original URL,Short Code,Short URL,Status,Error',
      ...results.map(result => 
        `"${result.originalUrl}","${result.shortCode}","${result.success ? `${window.location.origin}/${result.shortCode}` : ''}","${result.success ? 'Success' : 'Failed'}","${result.error || ''}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bulk-shortened-urls.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setUrls(text)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-indigo-50/30 rounded-2xl" />
        <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">
              Bulk URL Shortener
            </h2>
            <p className="text-gray-600">Process multiple URLs at once with advanced batch operations</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="bulkUrls" className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Enter URLs (one per line) or drag & drop a text file</span>
                </div>
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  dragActive ? 'scale-105 border-purple-400' : 'border-white/20'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <textarea
                  id="bulkUrls"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com&#10;&#10;Or drag and drop a text file here..."
                  rows={8}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 outline-none transition-all duration-300 resize-vertical"
                />
                {dragActive && (
                  <div className="absolute inset-0 bg-purple-500/10 border-2 border-dashed border-purple-400 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-purple-300 font-medium">Drop your file here</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Supports text files with URLs separated by line breaks</span>
                <span>{urls.split('\n').filter(url => url.trim()).length} URLs detected</span>
              </div>
            </div>
            
            <button
              onClick={handleBulkShorten}
              disabled={isProcessing || !urls.trim()}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing URLs...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Shorten All URLs</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Processing Results</span>
                </h3>
                <div className="flex space-x-3">
                  <button
                    onClick={copyAllResults}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy All</span>
                  </button>
                  <button
                    onClick={downloadResults}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${
                      result.success 
                        ? 'border-green-500/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20' 
                        : 'border-red-500/30 bg-gradient-to-r from-red-900/20 to-pink-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="text-sm text-gray-600 truncate font-mono">
                          {result.originalUrl}
                        </p>
                        {result.success ? (
                          <p className="text-sm font-medium text-green-400 flex items-center space-x-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="font-mono">{`${window.location.origin}/${result.shortCode}`}</span>
                          </p>
                        ) : (
                          <p className="text-sm text-red-400 flex items-center space-x-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Error: {result.error}</span>
                          </p>
                        )}
                      </div>
                      <div className={`ml-4 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                        result.success 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {result.success ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span>{result.success ? 'Success' : 'Failed'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{results.filter(r => r.success).length} successful</span>
                  </div>
                  <div className="flex items-center space-x-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{results.filter(r => !r.success).length} failed</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Total: {results.length} URLs processed
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}