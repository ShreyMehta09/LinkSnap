'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

interface URLData {
  _id: string
  shortCode: string
  originalUrl: string
  clicks: number
  createdAt: string
}

export default function URLList() {
  const [urls, setUrls] = useState<URLData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'clicks'>('createdAt')
  const { token } = useAuth()
  const { success, error } = useToast()

  useEffect(() => {
    if (token) {
      fetchUrls()
    }
  }, [token])

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUrls(data)
      } else {
        error('Failed to fetch URLs')
      }
    } catch (err) {
      error('Failed to fetch URLs')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (shortCode: string) => {
    try {
      const shortUrl = `${window.location.origin}/${shortCode}`
      await navigator.clipboard.writeText(shortUrl)
      success('📋 Copied to clipboard!')
    } catch (err) {
      error('Failed to copy to clipboard')
    }
  }

  const filteredUrls = urls
    .filter(url => 
      url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return b.clicks - a.clicks
      }
    })

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <div className="text-center text-gray-600 mt-4">Loading your URLs...</div>
        </div>
      </div>
    )
  }

  if (urls.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No URLs Found</h3>
          <p className="text-gray-500 mb-6">
            Create your first shortened URL to get started!
          </p>
          <button
            onClick={() => window.location.hash = '#shortener'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Create Short Link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Your URLs
            </h2>
            <p className="text-gray-600">
              Manage and track your shortened links
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Total:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                {urls.length}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Total Clicks:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                {urls.reduce((sum, url) => sum + url.clicks, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search URLs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50/50 focus:bg-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'clicks')}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
            >
              <option value="createdAt">Date Created</option>
              <option value="clicks">Click Count</option>
            </select>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredUrls.map((url) => (
            <div key={url._id} className="group hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-purple-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-blue-600 font-mono">
                        {url.shortCode}
                      </span>
                      <button
                        onClick={() => copyToClipboard(url.shortCode)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Copy short URL"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <a
                      href={`${window.location.origin}/${url.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Open short URL"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <div className="text-sm text-gray-600 break-all leading-relaxed" title={url.originalUrl}>
                    <span className="font-medium">Original:</span> {url.originalUrl}
                  </div>
                </div>
                <div className="flex items-center space-x-6 ml-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{url.clicks}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-700">
                      {new Date(url.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">created</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUrls.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or clear the search to see all URLs.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-blue-600 hover:text-purple-600 font-medium"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
