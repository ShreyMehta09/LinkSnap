import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
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

    const db = getDatabase()
    let shortCode = customCode

    // If custom code is provided, check if it's already taken
    if (customCode) {
      const existing = db.prepare(`
        SELECT short_code FROM urls WHERE short_code = ?
      `).get(customCode)
      
      if (existing) {
        return NextResponse.json({ error: 'Custom code already taken' }, { status: 400 })
      }
      
      // Validate custom code (alphanumeric and hyphens only)
      if (!/^[a-zA-Z0-9-_]+$/.test(customCode)) {
        return NextResponse.json({ error: 'Custom code can only contain letters, numbers, hyphens, and underscores' }, { status: 400 })
      }
    } else {
      shortCode = nanoid(8)
    }
    
    const result = db.prepare(`
      INSERT INTO urls (id, original_url, short_code, created_at, clicks)
      VALUES (?, ?, ?, ?, ?)
    `).run(nanoid(), url, shortCode, new Date().toISOString(), 0)

    const shortenedUrl = {
      id: result.lastInsertRowid,
      originalUrl: url,
      shortCode,
      createdAt: new Date().toISOString(),
      clicks: 0
    }

    return NextResponse.json(shortenedUrl)
  } catch (error) {
    console.error('Error shortening URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}