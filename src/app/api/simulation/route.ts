import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/utils/prisma'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { experimentId, count = 100, rates } = body

    if (!experimentId) {
      return NextResponse.json({ error: 'experimentId is required' }, { status: 400 })
    }

    const experiment = await prisma.experiment.findFirst({
      where: { id: experimentId, userId: user.id },
      include: { variants: true },
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    if (!experiment.variants || experiment.variants.length === 0) {
      return NextResponse.json({ error: 'Experiment has no variants' }, { status: 400 })
    }

    const numEvents = Math.min(Math.max(1, parseInt(count, 10) || 100), 10000)
    const variants = experiment.variants

    // Total allocation weights
    const totalWeight = variants.reduce((sum, v) => sum + (v.allocation || 50), 0) || 100

    const eventsToCreate: Array<{
      experimentId: string
      variantId: string
      visitorId: string
      eventType: string
      isSimulated: boolean
    }> = []

    for (let i = 0; i < numEvents; i++) {
      const visitorId = `sim_v_${Math.random().toString(36).substring(2, 12)}_${i}`
      
      // Select variant based on allocation
      let randWeight = Math.random() * totalWeight
      let selectedVariant = variants[0]
      for (const v of variants) {
        if (randWeight < (v.allocation || 50)) {
          selectedVariant = v
          break
        }
        randWeight -= (v.allocation || 50)
      }

      // Add impression
      eventsToCreate.push({
        experimentId,
        variantId: selectedVariant.id,
        visitorId,
        eventType: 'impression',
        isSimulated: true,
      })

      // Custom conversion rate or default based on variant
      const cvrPercent = rates && typeof rates[selectedVariant.id] === 'number'
        ? rates[selectedVariant.id]
        : (selectedVariant.name.toLowerCase().includes('control') ? 8 : 12)

      if (Math.random() * 100 < cvrPercent) {
        eventsToCreate.push({
          experimentId,
          variantId: selectedVariant.id,
          visitorId,
          eventType: 'conversion',
          isSimulated: true,
        })
      }
    }

    // Batch insert using createMany
    await prisma.event.createMany({
      data: eventsToCreate,
    })

    // Update status to Collecting Data or Winner Candidate if still Draft
    if (experiment.status === 'Draft' || experiment.status === 'Running' || experiment.status === 'Active') {
      await prisma.experiment.update({
        where: { id: experimentId },
        data: { status: 'Collecting Data' },
      })
    }

    return NextResponse.json({
      success: true,
      simulatedVisitors: numEvents,
      totalEventsCreated: eventsToCreate.length,
    })
  } catch (error: any) {
    console.error('Error simulating traffic:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to simulate traffic' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const experimentId = searchParams.get('experimentId')

    if (!experimentId) {
      return NextResponse.json({ error: 'experimentId is required' }, { status: 400 })
    }

    const experiment = await prisma.experiment.findFirst({
      where: { id: experimentId, userId: user.id },
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    // Delete ONLY simulated events (isSimulated = true)
    const result = await prisma.event.deleteMany({
      where: {
        experimentId,
        isSimulated: true,
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    })
  } catch (error: any) {
    console.error('Error clearing simulation data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to clear simulation data' },
      { status: 500 }
    )
  }
}
