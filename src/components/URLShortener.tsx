'use client'

import { useState } from 'react'
import { nanoid } from 'nanoid'

interface ShortenedURL {
  id: string
  originalUrl: string
  shortCode: string
  createdAt: string
  clicks: number
}

export default function URLShortener() {
  const [url, setUrl] = useState('')
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedURL[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to shorten URL')
      }

      const data = await response.json()
      setShortenedUrls(prev => [data, ...prev])
      setUrl('')
    } catch (err) {
      setError('Failed to shorten URL. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your long URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>
      </div>

      {shortenedUrls.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Shortened URLs</h2>
          <div className="space-y-4">
            {shortenedUrls.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">
                      Original: {item.originalUrl}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-lg font-medium text-blue-600">
                        {`${window.location.origin}/${item.shortCode}`}
                      </p>
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/${item.shortCode}`)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copy to clipboard"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                  <span>Clicks: {item.clicks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}