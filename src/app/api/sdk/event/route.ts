import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { experimentId, variantId, visitorId, eventType, isSimulated = false } = body

    if (!experimentId || !variantId || !visitorId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required parameters: experimentId, variantId, visitorId, eventType' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    if (eventType !== 'impression' && eventType !== 'conversion') {
      return NextResponse.json(
        { error: 'eventType must be either "impression" or "conversion"' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const activeStatuses = ['Active', 'Running', 'Collecting Data', 'Winner Candidate', 'Completed']

    // Verify experiment and variant exist and experiment is active
    const variant = await prisma.variant.findFirst({
      where: {
        id: variantId,
        experimentId: experimentId,
        experiment: {
          status: { in: activeStatuses },
        },
      },
    })

    if (!variant) {
      return NextResponse.json(
        { error: 'Active experiment or variant not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // Record Event in Event table
    await prisma.event.create({
      data: {
        experimentId,
        variantId,
        visitorId,
        eventType,
        isSimulated: Boolean(isSimulated),
      },
    })

    // Update legacy counter on Variant model for backward compatibility
    if (!isSimulated) {
      if (eventType === 'impression') {
        await prisma.variant.update({
          where: { id: variantId },
          data: { visits: { increment: 1 } },
        })
      } else if (eventType === 'conversion') {
        await prisma.variant.update({
          where: { id: variantId },
          data: { conversions: { increment: 1 } },
        })
      }
    }

    return NextResponse.json(
      { success: true },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (error: any) {
    console.error('Error tracking SDK event:', error)
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
