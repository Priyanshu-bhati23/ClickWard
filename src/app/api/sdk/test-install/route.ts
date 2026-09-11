import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const experimentId = searchParams.get('experimentId')

  if (!experimentId) {
    return NextResponse.json({ error: 'experimentId parameter is required' }, { status: 400 })
  }

  try {
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { events: true },
        },
      },
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    const totalEvents = experiment._count.events
    const lastEvent = experiment.events[0]

    if (totalEvents > 0 && lastEvent) {
      return NextResponse.json({
        status: 'CONNECTED',
        message: `SDK is active! Last event recorded ${new Date(lastEvent.createdAt).toLocaleTimeString()} (${lastEvent.eventType}).`,
        totalEvents,
        lastEventAt: lastEvent.createdAt,
        targetSelector: experiment.targetSelector || '#clickward-demo-cta',
      })
    }

    return NextResponse.json({
      status: 'NOT_DETECTED',
      message: 'No SDK activity detected yet. Add the script snippet to your site and visit your live page to verify.',
      totalEvents: 0,
      targetSelector: experiment.targetSelector || '#clickward-demo-cta',
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to test installation' }, { status: 500 })
  }
}
