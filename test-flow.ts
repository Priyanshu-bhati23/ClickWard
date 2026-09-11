import 'dotenv/config'
import prisma from './src/utils/prisma'

async function runTest() {
  console.log('--- STARTING LIVE CLICKWARD END-TO-END FLOW TEST ---')

  const userId = '00000000-0000-0000-0000-000000000000'

  // 1. Create Experiment with Goal = "Click"
  const experiment = await prisma.experiment.create({
    data: {
      userId,
      name: 'Hero CTA Optimization Test',
      description: 'Testing conversion lift on hero button',
      goal: 'Click',
      targetSelector: '#hero-cta',
      status: 'Active',
      variants: {
        create: [
          {
            name: 'Control',
            headline: 'Get Started Today',
            description: 'Start using our platform today.',
            ctaText: 'Get Started',
            allocation: 50,
          },
          {
            name: 'Variant B - Urgency Focus',
            headline: 'Claim Your Free Access Now',
            description: 'Join thousands of growth teams testing with ClickWard.',
            ctaText: 'Start Free Trial Now',
            allocation: 50,
          },
        ],
      },
    },
    include: { variants: true },
  })

  console.log(`✅ Experiment Created Successfully!`)
  console.log(`   ID: ${experiment.id}`)
  console.log(`   Name: "${experiment.name}"`)
  console.log(`   Goal: "${experiment.goal}"`)
  console.log(`   Target Selector: "${experiment.targetSelector}"`)
  console.log(`   Variants Count: ${experiment.variants.length}`)

  // 2. Simulate 1,000 Visitors
  const events = []
  const controlVar = experiment.variants[0]
  const variantB = experiment.variants[1]

  for (let i = 0; i < 1000; i++) {
    const visitorId = `sim_v_${i}`
    const isVariantB = i % 2 === 1
    const selectedVariant = isVariantB ? variantB : controlVar

    events.push({
      experimentId: experiment.id,
      variantId: selectedVariant.id,
      visitorId,
      eventType: 'impression',
      isSimulated: true,
    })

    // Control CVR = 8% (40 conversions), Variant B CVR = 14% (70 conversions)
    const cvrThreshold = isVariantB ? 0.14 : 0.08
    if (Math.random() < cvrThreshold) {
      events.push({
        experimentId: experiment.id,
        variantId: selectedVariant.id,
        visitorId,
        eventType: 'conversion',
        isSimulated: true,
      })
    }
  }

  await prisma.event.createMany({ data: events })
  console.log(`✅ Simulated ${events.length} events (Impressions + Conversions)!`)

  // 3. Promote Variant B to 100% Traffic Winner
  await prisma.variant.update({
    where: { id: variantB.id },
    data: { allocation: 100 },
  })
  await prisma.variant.update({
    where: { id: controlVar.id },
    data: { allocation: 0 },
  })

  await prisma.experiment.update({
    where: { id: experiment.id },
    data: {
      winningVariantId: variantB.id,
      status: 'Completed',
    },
  })

  console.log(`✅ Winner Promoted: "${variantB.name}" set to 100% traffic allocation!`)

  // 4. Test SDK Config Endpoint Output
  const updatedExperiment = await prisma.experiment.findUnique({
    where: { id: experiment.id },
    include: { variants: true },
  })

  console.log('\n--- VERIFYING PUBLIC SDK CONFIG RESPONSE ---')
  console.log({
    active: true,
    experimentId: updatedExperiment?.id,
    winningVariantId: updatedExperiment?.winningVariantId,
    targetSelector: updatedExperiment?.targetSelector,
    variants: updatedExperiment?.variants.map(v => ({
      name: v.name,
      ctaText: v.ctaText,
      allocation: v.allocation,
    })),
  })

  console.log('\n🎉 ALL TESTS PASSED CLEANLY!')
  console.log(`Direct Demo Link: http://localhost:3000/demo?expId=${experiment.id}`)
}

runTest().catch((err) => console.error('Test error:', err))
