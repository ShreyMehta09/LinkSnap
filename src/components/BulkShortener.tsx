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

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk URL Shortener</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="bulkUrls" className="block text-sm font-medium text-gray-700 mb-2">
              Enter URLs (one per line)
            </label>
            <textarea
              id="bulkUrls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-vertical"
            />
          </div>
          
          <button
            onClick={handleBulkShorten}
            disabled={isProcessing || !urls.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Shorten All URLs'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Results</h3>
              <div className="space-x-2">
                <button
                  onClick={copyAllResults}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Copy All
                </button>
                <button
                  onClick={downloadResults}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Download CSV
                </button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 truncate">
                        {result.originalUrl}
                      </p>
                      {result.success ? (
                        <p className="text-sm font-medium text-green-700 mt-1">
                          {`${window.location.origin}/${result.shortCode}`}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 mt-1">
                          Error: {result.error}
                        </p>
                      )}
                    </div>
                    <div className={`ml-4 px-2 py-1 rounded text-xs font-medium ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Success' : 'Failed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              {results.filter(r => r.success).length} successful, {results.filter(r => !r.success).length} failed
            </div>
          </div>
        )}
      </div>
    </div>
  )
}