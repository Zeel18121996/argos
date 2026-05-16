import { Injectable, BadRequestException } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import type { ProcessPaymentDto } from './dto/payment.dto'

export interface PaymentResult {
  paymentIntentId: string
  status: 'succeeded' | 'failed'
  message?: string
}

@Injectable()
export class PaymentsService {
  /** Simulated card processor.
   * Test card 4000000000000002 always fails.
   * All other cards succeed (after basic Luhn check).
   */
  async charge(dto: ProcessPaymentDto): Promise<PaymentResult> {
    const cleaned = dto.cardNumber.replace(/\s/g, '')
    if (cleaned === '4000000000000002') {
      return {
        paymentIntentId: `pi_failed_${uuidv4()}`,
        status: 'failed',
        message: 'Your card was declined. Please try a different payment method.',
      }
    }
    if (!this.luhnCheck(cleaned)) {
      throw new BadRequestException('Invalid card number')
    }
    return {
      paymentIntentId: `pi_${uuidv4()}`,
      status: 'succeeded',
    }
  }

  private luhnCheck(value: string): boolean {
    if (/[^0-9-\s]+/.test(value)) return false
    let nCheck = 0
    let bEven = false
    for (let n = value.length - 1; n >= 0; n--) {
      let nDigit = parseInt(value.charAt(n), 10)
      if (bEven) {
        if ((nDigit *= 2) > 9) nDigit -= 9
      }
      nCheck += nDigit
      bEven = !bEven
    }
    return nCheck % 10 === 0
  }
}
