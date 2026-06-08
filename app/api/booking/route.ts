import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    const { type, isProgram, date, time, contact } = payload

    if (
  !contact?.firstName ||
  !contact?.lastName ||
  !contact?.email ||
  !contact?.phone ||
  !type ||
  !date ||
  !time
) {
  return NextResponse.json(
    { error: 'Missing required fields' },
    { status: 400 }
  )
}

    await resend.emails.send({
      from: 'Velora Medical Institute <onboarding@resend.dev>',
      to: 'care@veloramedicalinstitute.com',
      subject: 'New Velora Booking Request',
      html: `
        <h2>New Booking Request</h2>

        <p><b>Service:</b> ${type}</p>
        <p><b>Program:</b> ${isProgram}</p>

        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>

        <hr/>

        <p><b>Name:</b> ${contact.firstName} ${contact.lastName || ''}</p>
        <p><b>Email:</b> ${contact.email}</p>
        <p><b>Phone:</b> ${contact.phone || ''}</p>
        <p><b>State:</b> ${contact.state}</p>

        <p><b>Notes:</b><br/>
        ${contact.notes || ''}</p>
      `
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