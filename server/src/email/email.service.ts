import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

interface SendOptions {
  to: string
  subject: string
  text: string
  html?: string
}

/**
 * Minimal email service. In dev we point at MailHog (no auth, plain SMTP);
 * in prod the same env vars can point at a real SMTP relay.
 *
 * Phase 1 only sends plaintext password-reset and order-confirmation emails;
 * Phase 7 adds HTML templates.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly transporter: nodemailer.Transporter
  private readonly from: string

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST', 'mailhog')
    const port = Number(this.config.get<number>('SMTP_PORT', 1025))
    const secure = this.config.get<string>('SMTP_SECURE', 'false') === 'true'
    const user = this.config.get<string>('SMTP_USER')
    const pass = this.config.get<string>('SMTP_PASS')
    const fromName = this.config.get<string>('SMTP_FROM_NAME', 'Argos Clone')
    const fromEmail = this.config.get<string>('SMTP_FROM_EMAIL', 'no-reply@argos.local')
    this.from = `${fromName} <${fromEmail}>`

    const transportConfig: nodemailer.TransportOptions = {
      host,
      port,
      secure,
    } as any

    if (user && pass) {
      ;(transportConfig as any).auth = { user, pass }
    }

    if (!secure && !user) {
      // MailHog / local dev — no TLS/auth needed
      ;(transportConfig as any).ignoreTLS = true
    }

    this.transporter = nodemailer.createTransport(transportConfig)
  }

  async send(opts: SendOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
      })
      this.logger.log(`Email sent to ${opts.to}: ${opts.subject}`)
    } catch (err) {
      // Email failures should not break the request. Log and move on.
      this.logger.error(`Email send failed for ${opts.to}: ${(err as Error).message}`)
    }
  }

  async sendPasswordReset(to: string, resetUrl: string, firstName: string): Promise<void> {
    await this.send({
      to,
      subject: 'Reset your Argos password',
      text: [
        `Hi ${firstName},`,
        '',
        'We received a request to reset your password. Click the link below to set a new password:',
        '',
        resetUrl,
        '',
        'This link expires in 1 hour. If you did not request a reset, ignore this email.',
        '',
        '— Argos Clone',
      ].join('\n'),
    })
  }

  async sendOrderConfirmation(
    to: string,
    orderNumber: string,
    total: number,
    itemCount: number,
  ): Promise<void> {
    const totalStr = `£${(total / 100).toFixed(2)}`
    await this.send({
      to,
      subject: `Order confirmed — ${orderNumber}`,
      text: [
        'Thank you for your order!',
        '',
        `Order number: ${orderNumber}`,
        `Items: ${itemCount}`,
        `Total: ${totalStr}`,
        '',
        'You can track your order at: http://localhost:3000/order/tracking',
        '',
        '— Argos Clone',
      ].join('\n'),
    })
  }
}
