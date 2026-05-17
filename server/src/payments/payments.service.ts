import { Injectable, Inject, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import Razorpay from 'razorpay'
import { RAZORPAY_CLIENT } from './razorpay.provider'

export interface CreateOrderResult {
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string
}

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(RAZORPAY_CLIENT) private readonly razorpay: Razorpay,
    private readonly config: ConfigService,
  ) {}

  /** Create a Razorpay order. Amount is in paise (1/100 INR). */
  async createOrder(amount: number, receipt: string): Promise<CreateOrderResult> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException('Invalid order amount')
    }
    const order = await this.razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
    })
    return {
      razorpayOrderId: order.id,
      amount: typeof order.amount === 'string' ? parseInt(order.amount, 10) : order.amount,
      currency: order.currency,
      keyId: this.config.getOrThrow<string>('RAZORPAY_KEY_ID'),
    }
  }

  /** Verify the signature returned by Razorpay's hosted checkout.
   * Razorpay HMAC-SHA256 signs `${razorpay_order_id}|${razorpay_payment_id}` with the key_secret.
   */
  verifySignature(orderId: string, paymentId: string, signature: string): void {
    const secret = this.config.getOrThrow<string>('RAZORPAY_KEY_SECRET')
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')
    const expectedBuf = Buffer.from(expected, 'hex')
    const actualBuf = Buffer.from(signature, 'hex')
    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      throw new BadRequestException('Invalid payment signature')
    }
  }
}
