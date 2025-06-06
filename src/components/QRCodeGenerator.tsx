'use client'

import { useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeGeneratorProps {
  url: string
}

export default function QRCodeGenerator({ url }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return
    
    const link = document.createElement('a')
    link.download = `qr-code-${url.split('/').pop()}.png`
    link.href = qrCodeUrl
    link.click()
  }

  return (
    <div className="mt-4">
      {!qrCodeUrl ? (
        <button
          onClick={generateQRCode}
          disabled={isGenerating}
          className="text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-center">
            <img src={qrCodeUrl} alt="QR Code" className="border border-gray-200 rounded-lg" />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={downloadQRCode}
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Download QR Code
            </button>
            <button
              onClick={() => setQrCodeUrl('')}
              className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Hide QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  )
}