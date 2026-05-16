# Skill: Argos Clone — Testing

## When to use this skill

Read this before writing a test on either side. Don't skip — the patterns below are non-negotiable so coverage targets are achievable.

---

## Coverage Targets

| Layer                                   | Tool         | Target                         |
| --------------------------------------- | ------------ | ------------------------------ |
| Client hooks + utils                    | Vitest       | ≥ 80 % lines                   |
| Client components (smoke / interaction) | Vitest + RTL | ≥ 60 % lines                   |
| Server services                         | Jest         | ≥ 80 % lines                   |
| Server e2e (controllers via Supertest)  | Jest e2e     | happy path on every controller |

CI fails on regressions, not on absolute coverage. Don't chase 100 % — chase risk.

---

## Client: Vitest + React Testing Library + MSW

### Setup (Phase 7 introduces this)

```bash
cd client
npm i -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
```

`client/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: { lines: 70, functions: 70, branches: 60, statements: 70 },
      exclude: ['**/*.d.ts', 'src/main.tsx', 'src/test/**', '**/*.skeleton.tsx'],
    },
  },
})
```

`client/src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { server } from './msw/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

`client/src/test/msw/server.ts`:

```ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
export const server = setupServer(...handlers)
```

`client/src/test/msw/handlers.ts` — start with a handler per resource that returns realistic envelope shapes (`{ data, message, timestamp }`) so the unwrap in `baseApi` exercises the real path.

### Test helper

```tsx
// client/src/test/renderWithProviders.tsx
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore, type PreloadedState } from '@reduxjs/toolkit'
import { baseApi } from '../app/baseApi'
import authReducer from '../features/auth/authSlice'
// ...other reducers
import { render } from '@testing-library/react'

export function renderWithProviders(
  ui: React.ReactNode,
  {
    preloadedState,
    route = '/',
  }: { preloadedState?: PreloadedState<RootState>; route?: string } = {},
) {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer, auth: authReducer /* ... */ },
    middleware: (gdm) => gdm().concat(baseApi.middleware),
    preloadedState,
  })
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  }
}
```

### Test file naming

Co-located, NOT under a top-level `__tests__/` folder.

```
client/src/
├── components/product/ProductCard.tsx
├── components/product/ProductCard.test.tsx     ← co-located
├── hooks/useDebounce.ts
└── hooks/useDebounce.test.ts
```

### What to test on the client (and what to skip)

**Test:**

- Custom hooks (`useAuth`, `useDebounce`, `useDataTable`, `useBasket`) — they hold real logic.
- Utils (`formatPrice`, `formatDate`, `cn`) — pure functions, easy wins.
- Component interactions that depend on user actions: clicking "Add to trolley" calls the right mutation; filter chip toggles update URL params; quantity stepper enforces min 1; checkout step validation rejects empty postcode.
- Reducers (auth login/logout, basketSlice optimistic add/remove).

**Skip:**

- Pure presentational layout (no logic). One smoke test ("renders without crashing") is enough.
- Third-party components (Radix, Lucide icons).
- Things RTK Query already guarantees (cache invalidation by tag).

### Example: hook test

```ts
// client/src/hooks/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

vi.useFakeTimers()

test('debounces value updates', () => {
  const { result, rerender } = renderHook(({ v }: { v: string }) => useDebounce(v, 300), {
    initialProps: { v: 'a' },
  })
  expect(result.current).toBe('a')

  rerender({ v: 'ab' })
  expect(result.current).toBe('a') // not yet
  act(() => {
    vi.advanceTimersByTime(300)
  })
  expect(result.current).toBe('ab')
})
```

### Example: component test

```tsx
// client/src/features/basket/AddToTrolleyButton.test.tsx
test('shows success state then opens basket drawer', async () => {
  const user = userEvent.setup()
  server.use(http.post('*/basket/items', () => HttpResponse.json({ data: { id: 'item-1' } })))

  renderWithProviders(<AddToTrolleyButton productId="p-1" />)
  await user.click(screen.getByRole('button', { name: /add to trolley/i }))

  expect(await screen.findByText(/added ✓/i)).toBeInTheDocument()
  // drawer
  expect(await screen.findByRole('dialog', { name: /your trolley/i })).toBeInTheDocument()
})
```

---

## Server: Jest + Supertest + @nestjs/testing

The Nest scaffold already has Jest configured (see `server/package.json` jest block). Don't change the test runner.

### Unit tests (services)

Use `@nestjs/testing` to assemble a service with a mocked Sequelize model. Don't hit the DB.

```ts
// server/src/products/products.service.spec.ts
import { Test } from '@nestjs/testing'
import { getModelToken } from '@nestjs/sequelize'
import { ProductsService } from './products.service'
import { ProductModel } from './models/product.model'

describe('ProductsService', () => {
  const productModel = {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<typeof ProductModel>

  let service: ProductsService

  beforeEach(async () => {
    jest.clearAllMocks()
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(ProductModel), useValue: productModel },
      ],
    }).compile()
    service = moduleRef.get(ProductsService)
  })

  it('applies brand + price filters and sorts by newest by default', async () => {
    ;(productModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] })
    await service.findAll({ brands: ['Apple'], minPrice: 100, page: 1, limit: 30 })
    expect(productModel.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          brand: expect.anything(),
          basePrice: expect.anything(),
        }),
        order: [['created_at', 'DESC']],
        limit: 30,
        offset: 0,
      }),
    )
  })

  it('throws NotFoundException for missing product', async () => {
    ;(productModel.findOne as jest.Mock).mockResolvedValue(null)
    await expect(service.findOne('00000000-0000-0000-0000-000000000000')).rejects.toThrow()
  })
})
```

### E2E tests (controllers)

Use Supertest against a Nest app booted with a **real Postgres test database** — not SQLite. Argos uses Postgres-specific features (JSONB, tsvector); SQLite drift breaks tests at the worst moment.

`server/test/jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "globalSetup": "./test/setup-e2e.ts"
}
```

`server/test/setup-e2e.ts`:

```ts
// Spawn (or assume CI provides) a fresh test DB, run migrations + seeds.
// Set process.env.DATABASE_URL to point at it before any test imports the AppModule.
```

Example e2e spec:

```ts
// server/test/products.e2e-spec.ts
import { Test } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { ResponseWrapperInterceptor } from '../src/common/interceptors/response-wrapper.interceptor'

describe('Products (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api/v1')
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    app.useGlobalInterceptors(new ResponseWrapperInterceptor())
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })

  it('GET /products returns paginated list with envelope', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/products?limit=5')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      data: expect.objectContaining({
        data: expect.any(Array),
        meta: expect.objectContaining({ page: 1, limit: 5, total: expect.any(Number) }),
      }),
      message: expect.any(String),
    })
  })

  it('POST /products without auth returns 401', async () => {
    const res = await request(app.getHttpServer()).post('/api/v1/products').send({ name: 'x' })
    expect(res.status).toBe(401)
  })
})
```

### What to e2e-test (one happy path per controller)

- **Auth:** register → login → me → refresh → logout. Cover the role redirect cases.
- **Products:** list filtering + sorting + pagination, get by id (404 case).
- **Basket:** add → update qty → remove → empty.
- **Checkout:** create session → set address → set delivery → pay (both success and `4000000000000002` failure).
- **Orders:** list own / detail / public tracking (with right + wrong postcode).
- **Admin:** create product (as staff), 403 as customer.

---

## Test Data: factories not fixtures

```ts
// server/test/factories/product.factory.ts
import { v4 as uuid } from 'uuid'
export const productFactory = (overrides = {}) => ({
  id: uuid(),
  name: 'Test Product',
  slug: 'test-product',
  brand: 'TestBrand',
  basePrice: 1999,
  isActive: true,
  ...overrides,
})
```

Use the factory in every test that needs a product. Fixed JSON fixtures rot fast.

---

## Common Pitfalls

- **Do NOT mock RTK Query.** Mock the HTTP layer via MSW so the unwrap-envelope path runs.
- **Do NOT share state between tests.** Build a fresh store in each `renderWithProviders` call.
- **Do NOT test implementation details.** Query by accessible role/label/text, not by class name or `data-testid` (use `data-testid` only when no accessible name exists).
- **Do NOT use real timers in async UI tests.** `vi.useFakeTimers()` + `vi.runAllTimersAsync()` keeps tests deterministic.
- **Do NOT skip the seed step in e2e setup.** Tests need realistic data; relying on empty DB hides bugs.
- **Do NOT assert exact error messages.** Match shape (`expect.objectContaining({ statusCode: 400 })`), not English strings — they will change.
