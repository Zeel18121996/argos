import * as path from 'path'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'
import { ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { envValidationSchema } from './config/env.validation'
import { CategoriesModule } from './categories/categories.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { AdminModule } from './admin/admin.module'
import { EmailModule } from './email/email.module'
import { ProductsModule } from './products/products.module'
import { SearchModule } from './search/search.module'
import { BasketModule } from './basket/basket.module'
import { WishlistModule } from './wishlist/wishlist.module'
import { OrdersModule } from './orders/orders.module'
import { PaymentsModule } from './payments/payments.module'
import { CheckoutModule } from './checkout/checkout.module'
import { TrevorModule } from './trevor/trevor.module'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      // .env lives at repo root, one level above server/
      envFilePath: path.resolve(__dirname, '../../.env'),
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true },
    }),

    // ── Database (Sequelize) ─────────────────────────────────────────
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        uri: config.get<string>('DATABASE_URL'),
        models: [], // models are registered per-feature via SequelizeModule.forFeature()
        autoLoadModels: true, // auto-registers models from forFeature() calls
        // In development, sync schema automatically (never in production — use migrations).
        // Set SEQUELIZE_SYNC=false (or NODE_ENV=production) to disable.
        synchronize:
          config.get<string>('SEQUELIZE_SYNC', 'true') === 'true' &&
          config.get<string>('NODE_ENV') === 'development',
        logging:
          config.get<string>('NODE_ENV') === 'development'
            ? (sql: string) => console.log(sql)
            : false,
        define: {
          underscored: true, // snake_case column names automatically
          timestamps: true, // adds created_at, updated_at
          createdAt: 'created_at',
          updatedAt: 'updated_at',
        },
      }),
    }),

    // ── Rate Limiting ────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000, // 1 minute window
        limit: 100, // 100 req / min (public endpoints)
      },
    ]),

    // ── Cross-cutting ────────────────────────────────────────────────
    EmailModule,

    // ── Feature modules ──────────────────────────────────────────────
    UsersModule,
    AuthModule,
    AdminModule,
    CategoriesModule,
    ProductsModule,
    SearchModule,
    BasketModule,
    WishlistModule,
    OrdersModule,
    PaymentsModule,
    CheckoutModule,
    TrevorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'APP_GUARD', useClass: JwtAuthGuard },
    { provide: 'APP_GUARD', useClass: RolesGuard },
  ],
})
export class AppModule {}
