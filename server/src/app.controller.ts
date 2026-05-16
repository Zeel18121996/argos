import { Controller, Get } from '@nestjs/common'
import { Public } from './common/decorators/public.decorator'

@Controller()
export class AppController {
  @Get('health')
  @Public()
  getHealth(): object {
    return {
      status: 'ok',
      service: 'argos-api',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
    }
  }
}
