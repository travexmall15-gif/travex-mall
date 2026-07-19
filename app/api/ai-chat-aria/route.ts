import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json()

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system,
        messages: messages.map((m: any) => ({
          role:    m.role,
          content: m.content,
        })),
      }),
    })

    const data = await res.json()
    const reply = data?.content?.[0]?.text || 'Sorry, I could not respond right now.'

    return NextResponse.json({ reply })
  } catch (e) {
    return NextResponse.json({ reply: 'Sorry, something went wrong. Please try again.' }, { status: 500 })
  }
}
