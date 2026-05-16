# Skill: Argos Clone – Backend (NestJS)

## When to use this skill

Read this skill before implementing any server-side feature in `server/`.

---

## Tech Stack Versions

- NestJS 10.x
- TypeScript 5.x (strict)
- **Sequelize 6.x + sequelize-typescript 2.x** (ORM)
- @nestjs/sequelize 10.x
- sequelize-cli 6.x (migrations + seeds)
- PostgreSQL 16
- Redis 7 (via `ioredis`)
- `class-validator` + `class-transformer`
- `@nestjs/jwt` + `passport-jwt`
- `@nestjs/throttler`
- `@nestjs/config` (with Joi validation)
- Jest (unit + e2e)

---

## Module Anatomy

Every feature lives in its own module folder. Minimum required files:

```
server/src/{module}/
├── {module}.module.ts       # imports, providers, exports
├── {module}.controller.ts   # route handlers (thin — delegate to service)
├── {module}.service.ts      # business logic
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── query-{entity}.dto.ts   # pagination/filter params
└── models/
    └── {entity}.model.ts     # Sequelize model (extends BaseModel)
```

---

## Module Template

```typescript
// products/products.module.ts
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { ProductModel } from './models/product.model'

@Module({
  imports: [SequelizeModule.forFeature([ProductModel])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // export if other modules need it
})
export class ProductsModule {}
```

---

## Controller Template

```typescript
// products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { QueryProductDto } from './dto/query-product.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { Public } from '../common/decorators/public.decorator'

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard) // default: all routes require auth
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public() // override auth for public read
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query)
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id)
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id)
  }
}
```

---

## Service Template

```typescript
// products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { ProductModel } from './models/product.model'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { QueryProductDto } from './dto/query-product.dto'
import { PaginatedResponseDto, buildMeta } from '../common/dto/paginated-response.dto'

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(ProductModel)
    private readonly productModel: typeof ProductModel,
  ) {}

  async findAll(query: QueryProductDto): Promise<PaginatedResponseDto<ProductModel>> {
    const { page = 1, limit = 30, sortBy = 'newest', brands, minPrice, maxPrice } = query

    const where: Record<string, unknown> = { isActive: true }
    if (brands?.length) where['brand'] = { [Op.in]: brands }
    if (minPrice != null) where['basePrice'] = { [Op.gte]: minPrice }
    if (maxPrice != null)
      where['basePrice'] = { ...(where['basePrice'] as object), [Op.lte]: maxPrice }

    const sortMap: Record<string, [string, string]> = {
      price_asc: ['base_price', 'ASC'],
      price_desc: ['base_price', 'DESC'],
      rating: ['avg_rating', 'DESC'],
      newest: ['created_at', 'DESC'],
    }
    const { count, rows } = await this.productModel.findAndCountAll({
      where,
      order: [sortMap[sortBy]],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    })

    return { data: rows, meta: buildMeta(page, limit, count as number) }
  }

  async findOne(id: string): Promise<ProductModel> {
    const product = await this.productModel.findOne({ where: { id, isActive: true } })
    if (!product) throw new NotFoundException(`Product ${id} not found`)
    return product
  }

  async create(dto: CreateProductDto): Promise<ProductModel> {
    return this.productModel.create({ ...dto } as ProductModel['_creationAttributes'])
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductModel> {
    await this.findOne(id)
    await this.productModel.update(dto as Partial<ProductModel>, { where: { id } })
    return this.findOne(id)
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id)
    await this.productModel.update({ isActive: false }, { where: { id } }) // soft delete
  }
}
```

---

## DTO Patterns

```typescript
// products/dto/query-product.dto.ts
import { IsOptional, IsInt, Min, Max, IsIn, IsArray, IsString, IsBoolean } from 'class-validator'
import { Transform, Type } from 'class-transformer'

export class QueryProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 30

  @IsOptional()
  @IsIn(['price_asc', 'price_desc', 'rating', 'newest'])
  sortBy?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  brands?: string[]

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  inStock?: boolean
}
```

```typescript
// products/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsInt, Min, IsUUID, IsOptional, MaxLength } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsNotEmpty()
  brand: string

  @IsUUID()
  categoryId: string

  @IsInt()
  @Min(1)
  basePrice: number // in pence

  @IsInt()
  @Min(0)
  @IsOptional()
  salePrice?: number // in pence
}
```

---

## Common Guards & Decorators

```typescript
// common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true
    return super.canActivate(context)
  }
}
```

```typescript
// common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common'
export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
```

```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
)
```

---

## Response Wrapper Interceptor

All endpoints automatically wrapped via global interceptor:

```typescript
// common/interceptors/response-wrapper.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class ResponseWrapperInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => ({
        data,
        message: 'OK',
        timestamp: new Date().toISOString(),
      })),
    )
  }
}
```

Register globally in `main.ts`:

```typescript
app.useGlobalInterceptors(new ResponseWrapperInterceptor())
app.useGlobalPipes(
  new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
)
app.useGlobalFilters(new HttpExceptionFilter())
```

---

## Paginated Response DTO

```typescript
// common/dto/paginated-response.dto.ts
export class PaginatedResponseDto<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

---

## Error Handling

```typescript
// common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const errors =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as Record<string, unknown>).message
        : exceptionResponse

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      errors: Array.isArray(errors) ? errors : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
```

---

## Auth Module Structure

```typescript
// auth/auth.module.ts
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
})
export class AuthModule {}
```

JWT payload shape:

```typescript
interface JwtPayload {
  sub: string // user UUID
  email: string
  role: 'user' | 'admin'
  iat: number
  exp: number
}
```

---

## Configuration (main.ts bootstrap)

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api/v1')
  app.enableCors({ origin: process.env.CLIENT_URL, credentials: true })
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  )
  app.useGlobalInterceptors(new ResponseWrapperInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())
  app.use(cookieParser())
  await app.listen(4000)
}
```

---

## Stock / Inventory

Stock is tracked at two levels:

- `ProductModel.stockCount` — base product stock
- `ProductVariantModel.stockCount` — per-variant stock

Effective available quantity for a basket line = `min(product.stockCount, variant.stockCount)` when a variant is selected, otherwise `product.stockCount`.

### Stock validation rules

1. **Basket add/update** — `BasketService.addItem()` and `updateItem()` check current stock before persisting. Rejects with `400` and message: `Only {maxStock} item(s) available. You already have {existing} in your basket.`
2. **Checkout** — `CheckoutService.validateStock()` runs **before payment processing** against live product/variant rows. Rejects with `400` if any item exceeds stock or product became inactive.
3. **Order creation** — `OrdersService.createFromBasket()` calls `decrementStock()` immediately after creating `OrderItemModel` rows. Uses `Sequelize.literal('stock_count - {qty}')` for atomic decrement.
4. **Order cancellation** — `OrdersService.cancel()` and `updateStatus()` to `'cancelled'` call `restoreStock()` to add quantities back via `Sequelize.literal('stock_count + {qty}')`.

### Admin product form

`AdminProductFormPage` exposes `stockCount` as a numeric input. Variant editor shows `stockCount` per variant. Changes take effect immediately for future basket/checkout operations.

---

## Common Pitfalls

- Do NOT put business logic in controllers. Controllers are thin — they call service methods only.
- Do NOT use Sequelize `synchronize: true` in production (data loss risk). The current scaffold uses it in dev only; **Phase 0 introduces real `sequelize-cli` migrations and Phase 1 disables `synchronize` in non-dev env**.
- Do NOT return Sequelize model instances directly with sensitive fields — exclude `passwordHash`, `tokenHash`, etc. via service-level mapping or class-transformer `@Exclude()` on a response DTO.
- Do NOT expose `password_hash` or internal `refresh_tokens` in any response.
- Always use `ParseUUIDPipe` on `:id` params to validate UUID format before hitting the database.
- Use `NotFoundException` (404) when a record is not found; do NOT return `null` from service methods.
- Money is INTEGER pence. Never DECIMAL or FLOAT.
- Stock counts are INTEGER. Never allow negative stock — the validation layer should reject overselling before decrement.
