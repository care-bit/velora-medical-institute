import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    const { name, email, phone, message } = payload

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await resend.emails.send({
      from: 'Velora Medical Institute <onboarding@resend.dev>',
      to: 'care@veloramedicalinstitute.com',
      subject: 'New Velora Website Request',
      html: `
        <h2>New Website Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Email failed' },
      { status: 500 }
    )
  }
}