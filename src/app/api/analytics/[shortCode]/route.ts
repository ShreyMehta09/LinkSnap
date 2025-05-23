import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = params
    const db = getDatabase()

    const url = db.prepare(`
      SELECT * FROM urls WHERE short_code = ?
    `).get(shortCode)

    if (!url) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 })
    }

    return NextResponse.json({
      shortCode: url.short_code,
      originalUrl: url.original_url,
      clicks: url.clicks,
      createdAt: url.created_at
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}