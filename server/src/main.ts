import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { ResponseWrapperInterceptor } from './common/interceptors/response-wrapper.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = app.get(ConfigService)
  const clientUrl = config.get<string>('CLIENT_URL', 'http://localhost:3000')
  const port = config.get<number>('PORT', 4000)

  // Global prefix — all routes start with /api/v1
  app.setGlobalPrefix('api/v1')

  // CORS — only allow our client origin, with credentials (for cookies)
  app.enableCors({
    origin: clientUrl,
    credentials: true,
  })

  // Cookie parser — needed for httpOnly refresh token
  app.use(cookieParser())

  // Global validation pipe — transforms + whitelists all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Global response wrapper — all responses wrapped in { data, message, timestamp }
  app.useGlobalInterceptors(new ResponseWrapperInterceptor())

  // Global exception filter — consistent error shape
  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(port)
  console.log(`🚀 Argos API running on http://localhost:${port}/api/v1`)
  console.log(`🏥 Health check: http://localhost:${port}/api/v1/health`)
}

bootstrap()
