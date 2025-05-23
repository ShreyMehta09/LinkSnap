'use client'

import { useState } from 'react'

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
      const response = await fetch(`/api/analytics/${shortCode}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Short code not found')
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

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">URL Analytics</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="shortCode" className="block text-sm font-medium text-gray-700 mb-2">
              Enter short code (e.g., abc123)
            </label>
            <input
              type="text"
              id="shortCode"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              placeholder="abc123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Loading...' : 'Get Analytics'}
          </button>
        </form>

        {analytics && (
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Results</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Short Code:</span>
                <p className="text-lg text-blue-600 font-mono">{analytics.shortCode}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Original URL:</span>
                <p className="text-sm text-gray-900 break-all">{analytics.originalUrl}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Total Clicks:</span>
                  <p className="text-2xl font-bold text-green-600">{analytics.clicks}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Created:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(analytics.createdAt).toLocaleDateString()}
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