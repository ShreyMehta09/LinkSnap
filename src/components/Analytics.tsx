'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface AnalyticsData {
  shortCode: string
  originalUrl: string
  clicks: number
  createdAt: string
}

export default function Analytics() {
  const [shortCode, setShortCode] = useState('')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { token } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAnalytics(null)
    
    if (!shortCode.trim()) {
      setError('Please enter a short code')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/analytics/${shortCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Short code not found or you don\'t have access to it')
        } else {
          setError('Failed to fetch analytics')
        }
        return
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError('Failed to fetch analytics. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getClicksColor = (clicks: number) => {
    if (clicks === 0) return 'text-gray-500'
    if (clicks < 10) return 'text-yellow-600'
    if (clicks < 50) return 'text-orange-600'
    if (clicks < 100) return 'text-green-600'
    return 'text-blue-600'
  }

  const getPerformanceLevel = (clicks: number) => {
    if (clicks === 0) return { level: 'No Activity', color: 'bg-gray-100 text-gray-800 border border-gray-200' }
    if (clicks < 10) return { level: 'Low Activity', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' }
    if (clicks < 50) return { level: 'Moderate Activity', color: 'bg-orange-100 text-orange-800 border border-orange-200' }
    if (clicks < 100) return { level: 'High Activity', color: 'bg-green-100 text-green-800 border border-green-200' }
    return { level: 'Very High Activity', color: 'bg-blue-100 text-blue-800 border border-blue-200' }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            URL Analytics
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Get detailed insights about your shortened links
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          <div className="space-y-2">
            <label htmlFor="shortCode" className="block text-sm font-semibold text-gray-700">
              Enter Short Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <input
                type="text"
                id="shortCode"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                placeholder="Enter your short code (e.g., abc123)"
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
              />
            </div>
          </div>
          
          {error && (
            <div className="flex items-start space-x-2 text-red-600 text-sm bg-red-50 px-3 sm:px-4 py-3 rounded-lg border border-red-200">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="leading-5">{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !shortCode.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none text-sm sm:text-base"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Get Analytics</span>
              </span>
            )}
          </button>
        </form>

        {analytics && (
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Results</h3>
              <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto ${getPerformanceLevel(analytics.clicks).color}`}>
                {getPerformanceLevel(analytics.clicks).level}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">{/* Short Code Card */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-blue-800">Short Code</h4>
                    <p className="text-lg sm:text-2xl font-bold text-blue-900 font-mono break-all">{analytics.shortCode}</p>
                  </div>
                </div>
              </div>

              {/* Clicks Card */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-green-800">Total Clicks</h4>
                    <p className={`text-xl sm:text-3xl font-bold ${getClicksColor(analytics.clicks)}`}>
                      {analytics.clicks.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Original URL Card */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border border-purple-200 mb-4 sm:mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-purple-800 mb-2">Original URL</h4>
                  <div className="text-xs sm:text-sm text-purple-900 break-all leading-relaxed bg-white/70 p-2 sm:p-3 rounded-lg">
                    {analytics.originalUrl}
                  </div>
                </div>
              </div>
            </div>

            {/* Creation Date Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700">Created On</h4>
                  <p className="text-sm sm:text-lg font-semibold text-gray-900">
                    {new Date(analytics.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {Math.floor((Date.now() - new Date(analytics.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}