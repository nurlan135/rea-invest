import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'ok',
      timestamp: Date.now(),
      message: 'Test endpoint working'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Test failed', details: String(error) },
      { status: 500 }
    )
  }
}