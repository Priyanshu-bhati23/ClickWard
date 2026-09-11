import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/utils/prisma'
import Groq from 'groq-sdk'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        {
          error: 'GROQ_API_KEY is not configured on the server. Please set GROQ_API_KEY in your .env file.',
        },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { experimentId, name, description, goal, controlVariant } = body

    if (!experimentId) {
      return NextResponse.json({ error: 'experimentId is required' }, { status: 400 })
    }

    // Verify ownership
    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
    })

    if (!experiment || experiment.userId !== user.id) {
      return NextResponse.json({ error: 'Experiment not found or access denied' }, { status: 404 })
    }

    const groq = new Groq({ apiKey })

    const prompt = `
You are an expert CRO (Conversion Rate Optimization) copywriter for ClickWard, an A/B testing platform.

Generate 3 high-converting variant options for an A/B test.

Experiment Details:
- Experiment Name: "${name || experiment.name}"
- Description: "${description || experiment.description || 'None'}"
- Optimization Goal: "${goal || experiment.goal}"

Control Variant (Current Baseline):
- Headline: "${controlVariant?.headline || 'Control'}"
- Description: "${controlVariant?.description || ''}"
- CTA Text: "${controlVariant?.ctaText || 'Get Started'}"

Instructions:
1. Provide 3 distinct variants: Option A (Urgency/Scarcity focus), Option B (Value/Benefit focus), Option C (Social Proof/Clarity focus).
2. Each variant MUST have:
   - "name": Brief label (e.g. "Variant A - High Urgency")
   - "headline": Compelling headline optimized for conversion
   - "description": Supporting body copy or sub-headline
   - "ctaText": High-action CTA button text (2-5 words)
3. Return ONLY a valid JSON object matching this structure:
{
  "variants": [
    { "name": "...", "headline": "...", "description": "...", "ctaText": "..." }
  ]
}
`

    let completion
    try {
      completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a conversion rate optimization expert. Always respond with strict, valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })
    } catch (e: any) {
      // Fallback model if 70b is rate limited or unavailable
      completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a conversion rate optimization expert. Always respond with strict, valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        model: 'llama3-8b-8192',
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })
    }

    const rawResponse = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(rawResponse)

    if (!parsed.variants || !Array.isArray(parsed.variants)) {
      return NextResponse.json({ error: 'Invalid response format from AI model' }, { status: 500 })
    }

    return NextResponse.json({ variants: parsed.variants })
  } catch (error: any) {
    console.error('Error generating AI variants:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI variants' },
      { status: 500 }
    )
  }
}
