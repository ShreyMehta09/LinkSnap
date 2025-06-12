import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { URL as URLModel } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  try {
    const { shortCode } = await params
    await dbConnect()

    const urlRecord = await URLModel.findOne({ shortCode })

    if (!urlRecord) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Increment click count
    await URLModel.findByIdAndUpdate(urlRecord._id, { $inc: { clicks: 1 } })

    return NextResponse.redirect(urlRecord.originalUrl)
  } catch (error) {
    console.error('Error redirecting:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}