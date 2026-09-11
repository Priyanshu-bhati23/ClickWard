import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const experimentId = searchParams.get('experimentId')

  if (!experimentId) {
    return NextResponse.json(
      { error: 'experimentId parameter is required' },
      {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    )
  }

  try {
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            ctaText: true,
            targetHref: true,
            targetVisible: true,
            headline: true,
            description: true,
            allocation: true,
          },
        },
      },
    })

    if (!experiment) {
      return NextResponse.json(
        { active: false, reason: 'Experiment not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const activeStatuses = ['Active', 'Running', 'Collecting Data', 'Winner Candidate', 'Completed']
    if (!activeStatuses.includes(experiment.status)) {
      return NextResponse.json(
        { active: false, reason: `Experiment is in "${experiment.status}" state` },
        { headers: { 'Access-Control-Allow-Origin': '*' } }
      )
    }

    // If a winner has been promoted, override allocation so winning variant gets 100% traffic
    let variants = experiment.variants
    if (experiment.winningVariantId) {
      variants = experiment.variants.map((v) => ({
        ...v,
        allocation: v.id === experiment.winningVariantId ? 100 : 0,
      }))
    }

    return NextResponse.json(
      {
        active: true,
        experimentId: experiment.id,
        status: experiment.status,
        winningVariantId: experiment.winningVariantId,
        targetSelector: experiment.targetSelector || '#clickward-demo-cta',
        variants,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
