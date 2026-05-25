import { Body, Controller, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Public } from '../common/decorators/public.decorator'
import { TrevorService } from './trevor.service'
import { TrevorChatDto } from './dto/trevor-chat.dto'

@Controller('trevor')
export class TrevorController {
  constructor(private readonly trevorService: TrevorService) {}

  /**
   * Chat with Trevor — Argos AI shopping assistant.
   * Public endpoint (no auth required) but throttled to 20 req/min/IP
   * to keep OpenAI costs in check.
   */
  @Post('chat')
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  chat(@Body() dto: TrevorChatDto) {
    return this.trevorService.chat(dto)
  }
}
