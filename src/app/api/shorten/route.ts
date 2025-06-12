import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import dbConnect from '@/lib/mongodb'
import { URL as URLModel } from '@/lib/models'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { url, customCode } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    await dbConnect()
    let shortCode = customCode

    // If custom code is provided, check if it's already taken
    if (customCode) {
      const existing = await URLModel.findOne({ shortCode: customCode })
      
      if (existing) {
        return NextResponse.json({ error: 'Custom code already taken' }, { status: 400 })
      }
      
      // Validate custom code (alphanumeric and hyphens only)
      if (!/^[a-zA-Z0-9-_]+$/.test(customCode)) {
        return NextResponse.json({ error: 'Custom code can only contain letters, numbers, hyphens, and underscores' }, { status: 400 })
      }
    } else {
      // Generate unique short code
      do {
        shortCode = nanoid(8)
      } while (await URLModel.findOne({ shortCode }))
    }
    
    // Create new URL record
    const urlRecord = new URLModel({
      originalUrl: url,
      shortCode,
      userId: payload.userId,
    })

    await urlRecord.save()

    const shortenedUrl = {
      id: urlRecord._id,
      originalUrl: url,
      shortCode,
      createdAt: urlRecord.createdAt,
      clicks: 0
    }

    return NextResponse.json(shortenedUrl)
  } catch (error) {
    console.error('Error shortening URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}