import { Resend } from 'resend'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  return new Resend(apiKey)
}

interface SendBriefEmailParams {
  to: string
  founderName: string
  brandName: string
  pdfUrl: string
}

export async function sendBriefEmail({
  to,
  founderName,
  brandName,
  pdfUrl,
}: SendBriefEmailParams) {
  // Fetch the PDF
  const pdfResponse = await fetch(pdfUrl)
  const pdfBuffer = await pdfResponse.arrayBuffer()

  const firstName = founderName.split(' ')[0]
  const resend = getResendClient()

  const { data, error } = await resend.emails.send({
    from: 'WhiteCoat Brief <briefs@whitecoatbrief.com>',
    to: [to],
    subject: `Your WhiteCoat Brief for ${brandName} is Ready`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="margin-bottom: 30px;">
          <span style="font-family: 'JetBrains Mono', monospace; color: #059669; font-size: 12px; font-weight: bold; letter-spacing: 2px;">WHITECOAT BRIEF™</span>
        </div>

        <h1 style="font-size: 24px; color: #0F172A; margin-bottom: 20px;">
          Hi ${firstName},
        </h1>

        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
          Your WhiteCoat Brief for <strong>${brandName}</strong> is attached!
        </p>

        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
          This document contains your personalized marketing playbook, including:
        </p>

        <ul style="font-size: 16px; color: #475569; line-height: 1.8; margin-bottom: 30px; padding-left: 20px;">
          <li>Competitive landscape analysis</li>
          <li>Strategic positioning recommendations</li>
          <li>Creative concepts and ad hooks</li>
          <li>A 4-week testing roadmap</li>
        </ul>

        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 30px;">
          Questions? Just reply to this email — we'd love to hear from you.
        </p>

        <p style="font-size: 16px; color: #0F172A; line-height: 1.6;">
          Best,<br>
          <strong>The WhiteCoat Brief Team</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 40px 0;" />

        <p style="font-size: 12px; color: #94A3B8;">
          © 2026 WhiteCoat Brief™ | Marketing Intelligence for Physician-Founded Brands
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `WhiteCoat-Brief-${brandName.replace(/\s+/g, '-')}.pdf`,
        content: Buffer.from(pdfBuffer),
      },
    ],
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data
}
