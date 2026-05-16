import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { ResponseWrapperInterceptor } from './common/interceptors/response-wrapper.interceptor'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { promises as fs } from 'fs'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const config = app.get(ConfigService)
  const clientUrl = config.get<string>('CLIENT_URL', 'http://localhost:3000')
  const port = config.get<number>('PORT', 4000)
  const isDev = config.get<string>('NODE_ENV') === 'development'

  // Global prefix — all routes start with /api/v1
  app.setGlobalPrefix('api/v1')

  // CORS — only allow our client origin, with credentials (for cookies).
  // In dev, also accept any localhost port so Vite can fall back to 3001/3002 when 3000 is busy.
  const allowedOrigins = [clientUrl]
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true) // same-origin / curl / server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, true)
      if (isDev && /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
      return callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
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

  // Ensure uploads directory exists
  const uploadsDir = join(__dirname, '..', 'uploads')
  try {
    await fs.access(uploadsDir)
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true })
  }

  // Static file serving for uploaded product images
  app.useStaticAssets(uploadsDir, { prefix: '/static/uploads' })

  await app.listen(port)
  console.log(`🚀 Argos API running on http://localhost:${port}/api/v1`)
  console.log(`🏥 Health check: http://localhost:${port}/api/v1/health`)
  console.log(`🖼️  Static uploads: http://localhost:${port}/static/uploads`)
}

bootstrap()
