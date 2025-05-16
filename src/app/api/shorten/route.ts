import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { getDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const shortCode = nanoid(8)
    const db = getDatabase()
    
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