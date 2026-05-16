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
    this.from = this.config.get<string>('SMTP_FROM', 'Argos Clone <no-reply@argos.local>')

    this.transporter = nodemailer.createTransport({
      host,
      port,
      // MailHog doesn't require TLS/auth
      secure: false,
      ignoreTLS: true,
    })
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
}
