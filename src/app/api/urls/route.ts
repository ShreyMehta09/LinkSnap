import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { URL as URLModel } from '@/lib/models'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    await dbConnect()

    const urls = await URLModel.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .select('shortCode originalUrl clicks createdAt')

    return NextResponse.json(urls)
  } catch (error) {
    console.error('Error fetching user URLs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
