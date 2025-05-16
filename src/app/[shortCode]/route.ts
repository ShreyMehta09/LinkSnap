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
      SELECT original_url FROM urls WHERE short_code = ?
    `).get(shortCode) as { original_url: string } | undefined

    if (!url) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Increment click count
    db.prepare(`
      UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?
    `).run(shortCode)

    return NextResponse.redirect(url.original_url)
  } catch (error) {
    console.error('Error redirecting:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}