/* eslint-disable */
// One-shot generator for the "Vibe Coding — Argos Clone" document.
// Run with: node docs/build-doc.cjs

const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, BorderStyle, WidthType, ShadingType, HeadingLevel,
  PageBreak,
} = require('docx')

// ─── Theme constants ────────────────────────────────────────────────────────
const ARGOS_RED = 'D42114'
const ARGOS_BLUE = '044C99'
const ARGOS_GREY = '333333'
const SUBTLE = '707070'
const PALE_BG = 'F5F5F5'
const BORDER = 'CCCCCC'

const FONT = 'Calibri'
const CODE_FONT = 'Consolas'

const border = (color = BORDER) => ({ style: BorderStyle.SINGLE, size: 6, color })
const cellBorders = { top: border(), bottom: border(), left: border(), right: border() }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const P = (text, opts = {}) =>
  new Paragraph({
    children: [new TextRun({ text, ...opts.run })],
    spacing: { after: 120, ...opts.spacing },
    alignment: opts.alignment,
  })

const H1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true })],
    spacing: { before: 360, after: 200 },
  })

const H2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true })],
    spacing: { before: 280, after: 140 },
  })

const H3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true })],
    spacing: { before: 200, after: 100 },
  })

const Bullet = (text, level = 0, runs) =>
  new Paragraph({
    numbering: { reference: 'bullets', level },
    children: runs ?? [new TextRun({ text })],
    spacing: { after: 80 },
  })

const Numbered = (text, level = 0) =>
  new Paragraph({
    numbering: { reference: 'numbers', level },
    children: [new TextRun({ text })],
    spacing: { after: 80 },
  })

// Code block — shading only, no border (avoids docx-js OOXML order issue).
const CodeBlock = (lines) =>
  new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: PALE_BG },
    spacing: { before: 80, after: 160 },
    indent: { left: 200, right: 200 },
    children: lines.flatMap((line, i) => [
      new TextRun({ text: line, font: CODE_FONT, size: 20, color: '262626' }),
      ...(i < lines.length - 1 ? [new TextRun({ break: 1 })] : []),
    ]),
  })

// Italic-quote block. We avoid setting <w:pBdr> because docx-js can serialize
// border children out of OOXML schema order; instead we rely on shading + a
// blue-text accent for visual distinction.
const Quote = (text) =>
  new Paragraph({
    indent: { left: 360, right: 360 },
    shading: { type: ShadingType.CLEAR, fill: 'F4F7FB' },
    spacing: { before: 120, after: 160 },
    children: [
      new TextRun({ text: '“', italics: true, color: ARGOS_BLUE, size: 28, bold: true }),
      new TextRun({ text, italics: true, color: '333333' }),
      new TextRun({ text: '”', italics: true, color: ARGOS_BLUE, size: 28, bold: true }),
    ],
  })

// Table builder
const headCell = (text) =>
  new TableCell({
    borders: cellBorders,
    width: { size: 4500, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: ARGOS_BLUE },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 22 })] })],
  })

const bodyCell = (text, opts = {}) =>
  new TableCell({
    borders: cellBorders,
    width: { size: opts.width ?? 4500, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 22 })] })],
  })

const buildTable = (headers, rows, columnWidths) =>
  new Table({
    width: { size: columnWidths.reduce((s, n) => s + n, 0), type: WidthType.DXA },
    columnWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          new TableCell({
            borders: cellBorders,
            width: { size: columnWidths[i], type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: ARGOS_BLUE },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 22 })] })],
          }),
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map((cell, i) =>
              new TableCell({
                borders: cellBorders,
                width: { size: columnWidths[i], type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [new Paragraph({ children: [new TextRun({ text: cell, size: 22 })] })],
              }),
            ),
          }),
      ),
    ],
  })

// ─── Title page ──────────────────────────────────────────────────────────────
const title = new Paragraph({
  spacing: { before: 1200, after: 240 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'AI Acceleration Month', bold: true, size: 56, color: ARGOS_RED })],
})

const subtitle = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 80 },
  children: [new TextRun({ text: 'Practical Vibe-Coding Activity', bold: true, size: 36, color: ARGOS_BLUE })],
})

const tagline = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 240 },
  children: [
    new TextRun({
      text: 'Replicating argos.co.uk end-to-end with Claude Code',
      italics: true,
      size: 28,
      color: SUBTLE,
    }),
  ],
})

const meta = new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 1200 },
  children: [
    new TextRun({ text: 'Author: Zeel Patel', size: 22, color: ARGOS_GREY }),
    new TextRun({ break: 1 }),
    new TextRun({ text: 'Stack: React 19 + NestJS 10 + PostgreSQL 16', size: 22, color: ARGOS_GREY }),
    new TextRun({ break: 1 }),
    new TextRun({ text: 'AI Pair: Anthropic Claude (via Claude Code CLI)', size: 22, color: ARGOS_GREY }),
  ],
})

// ─── Content ────────────────────────────────────────────────────────────────
const children = [
  // Cover
  title,
  subtitle,
  tagline,
  meta,
  new Paragraph({ children: [new PageBreak()] }),

  // 1. The Assignment
  H1('1. The Assignment'),
  P(
    'As part of the AI Acceleration Month "Practical Vibe Coding" activity, I was challenged to replicate the platform at https://www.argos.co.uk/ using Claude as my AI pair. The deliverable had four explicit pillars:',
  ),
  Bullet('Claude Code configuration & setup'),
  Bullet('Git version control & repository management'),
  Bullet('Database integration & API setup'),
  Bullet('Complete portal replication & testing'),
  P(
    'The goal was not a toy demo. It was to build a production-ready full-stack e-commerce web portal — pixel-perfect customer storefront on one side, functional admin panel on the other.',
  ),

  // 2. My Prompts
  H1('2. The Prompts I Used'),
  P(
    'My workflow with Claude was a sequence of progressively-focused prompts. The early ones set scope and pulled the plan together; the later ones converged on pixel-perfect detail by pasting in real CSS from argos.co.uk and asking Claude to mirror it.',
  ),

  H2('2.1 Opening prompt (set the whole scope)'),
  Quote(
    'First check all skills md files. I want to build a product same as https://www.argos.co.uk/, production-ready with no bugs. I currently have just a static frontend and a basic backend setup. Please update or create new skills files and rules. I want React and NestJS. Make sure it is fully functional. I want an admin panel where staff add products and see all customers, and a customer panel that currently you see on argos.co.uk. Add your expertise on what we can do and create a phase-by-phase plan.',
  ),
  P(
    'This single prompt did three things: (a) made Claude audit existing skill-rule files first, (b) committed me to the React + NestJS stack, (c) asked for both a customer panel and an admin panel, (d) requested a phased plan rather than a single big-bang build.',
  ),

  H2('2.2 Phase 1 kick-off — pixel-perfect auth screens'),
  Quote(
    'Now start with Phase 1. After Phase 1 is complete I need to test that it is properly working. Customer login and sign-up pages must be the same as argos.co.uk/login and argos.co.uk/my-account/register. Plan likewise and start executing. Make sure both frontend and backend work.',
  ),

  H2('2.3 Iterative design feedback loop'),
  P(
    'For the next several rounds I followed a tight loop: open the live Argos page in one tab and my localhost in another, screenshot both, drop the screenshot in the chat, and tell Claude what was different. Examples of recurring follow-ups:',
  ),
  Bullet('"still it seems different — please make it same"'),
  Bullet('"font family used in argos and local seems different"'),
  Bullet('"the slider has left and right spacing"'),
  Bullet('"compare and make it similar — focus on the header logo section"'),
  Bullet('"use this file as the logo — E:\\Code\\ArgosC\\client\\src\\assets\\argos-logo.png"'),

  H2('2.4 CSS-first matching (the key unlock)'),
  P(
    'The breakthrough was pasting argos.co.uk\'s own computed CSS into the chat and asking Claude to mirror it value-for-value. Once I started doing that, the visual gap closed fast. Sample paste:',
  ),
  CodeBlock([
    'header._1TMAp {',
    '  display: block;',
    '  position: relative;',
    '  z-index: 61;',
    '  background-color: rgb(255, 255, 255);',
    '  color: rgb(51, 51, 51);',
    '  font-family: Barlow, ArgosBook, sans-serif;',
    '  font-size: 16px;',
    '  font-weight: 400;',
    '  border: 0px none;',
    '  box-shadow: none;',
    '}',
  ]),
  P(
    'Claude then produced the matching React + Tailwind code with the exact tokens — sticky positioning, z-index 61, Barlow stack, dark-grey text, no border. The same pattern repeated for the utility bar (.m-jtR / ._1JjmG / ._1II2j / ._3l0Ci), the search bar (._7blr5 / ._1Rz0y / ._2mKaC / ._1gqeQ), the "Ask Trevor" pill (.gnQ4T), the right-side icons (._20hv0 / .UwMfe / ._2wsKA / .LQbCV), the nav tabs, and the slider (.ds-c-slides__*).',
  ),

  // 3. Strategy
  H1('3. The Strategy I Followed'),
  P(
    'Six principles drove the build. Each one is small on its own, but together they kept Claude productive across a multi-hour build session without losing the plot.',
  ),

  H3('3.1 Skills-first — rules before code'),
  P(
    'The very first thing Claude did was set up a folder of markdown rule files at .warp/skills/. Twelve files in total — frontend, backend, database, design-tokens, pixel-perfect, components, access-control, admin-panel, api-contracts, testing, git-workflow, qa-acceptance — each one a small, focused document that future Claude turns automatically read before touching code.',
  ),
  Bullet('Frontend: React 19 + RTK Query + Redux Toolkit patterns'),
  Bullet('Backend: NestJS module / controller / service / DTO template'),
  Bullet('Database: Sequelize 6 model + migration + seeder conventions'),
  Bullet('Design tokens: every Argos color, font size, spacing, shadow'),
  Bullet('Pixel-perfect: per-page checklist matching argos.co.uk'),
  Bullet('Access control: customer / staff / admin role hierarchy'),
  Bullet('Admin panel: DataTable, AdminFormShell, image uploader patterns'),
  Bullet('Git workflow: Conventional Commits, branches, husky hooks'),
  Bullet('QA acceptance: per-phase acceptance gates, a11y, Lighthouse targets'),
  Bullet('API contracts: every endpoint shape, query DTO, error code'),
  Bullet('Testing: Vitest + RTL + MSW (client), Jest + Supertest (server)'),

  H3('3.2 Plan mode — design before doing'),
  P(
    'I asked Claude to enter plan mode before any large change. The result is a saved plan file at C:\\Users\\zeel.patel\\.claude\\plans\\first-check-all-skills-twinkling-map.md with Context, Approach, Scope decisions locked with the user (simulated payments, local /uploads, lean admin, static stores list), the full phase plan, critical files to modify, and a verification section. Plan mode also forced me to answer three crisp scope questions before any code was written.',
  ),

  H3('3.3 Phase-by-phase vertical slices'),
  P(
    'Every phase was a single thin slice that went all the way from migration to UI to test. No "build the whole DB first, then the whole API, then the whole frontend." Each phase ended with: unit tests, e2e happy path, branch merged, seeders updated.',
  ),

  H3('3.4 CSS-driven pixel matching'),
  P(
    'Once Phase 1 was functionally working, the design pass moved to feeding Claude argos.co.uk\'s actual computed CSS — header wrapper, utility bar, search bar, nav tabs, slider, every right-side icon button. Claude mirrored each value-for-value into Tailwind + inline style props. Every change carried a comment in the source linking back to the Argos selector it was matching.',
  ),

  H3('3.5 Conventional Commits + Husky'),
  P(
    'Phase 0 wired a root-level Husky setup: pre-commit runs lint-staged (Prettier auto-format), commit-msg runs @commitlint/cli with the standard config. A bad commit message (or one with body lines over 100 chars) is rejected. The initial commit landed cleanly on the main branch with a fully Conventional-Commits message; every subsequent change goes through the same hook chain.',
  ),

  H3('3.6 Iterative refinement with screenshots'),
  P(
    'The visual-diff loop is the loop. Open the Argos page, screenshot, paste, describe what\'s different, Claude rebuilds, repeat. The closer we got, the more specific the diffs became: from "the page is wrong" → "the heading is centered, mine is left-aligned" → "font-weight is 400 not 600" → "the active dot should be 32px wide, mine is 12px round."',
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // 4. Phase Plan
  H1('4. The Phase Plan'),
  P(
    'Eight phases. Phase 0 establishes the runway; Phases 1–6 are the build proper; Phase 7 is polish.',
  ),
  buildTable(
    ['Phase', 'Title', 'Scope summary'],
    [
      ['0', 'Foundations', 'git init, .gitignore, husky + commitlint, docker-compose (Postgres, Redis, MailHog), 12 skill files, port alignment, MailHog wiring'],
      ['1', 'Auth & Users', 'JWT 15 min access + 7 d refresh (httpOnly cookie), bcrypt, register/login/refresh/logout/forgot/reset, addresses CRUD, JwtStrategy, role-based redirect'],
      ['2', 'Catalogue', 'Products + variants + images, browse with full filters, search via Postgres FTS, PDP, admin Products CRUD with image uploader'],
      ['3', 'Basket & Wishlist', 'Guest basket (Redis), user basket (Postgres), merge on login, optimistic UI, wishlist'],
      ['4', 'Checkout, Orders, Payments', '3-step checkout, simulated card processor (Stripe-style failure card 4000000000000002), public order tracking, admin Orders table'],
      ['5', 'Admin Panel (lean v1)', 'Stat-card dashboard, Customers table with detail drawer, Categories list, role / status patches'],
      ['6', 'Reviews, Promotions, Stores, Help', 'Customer reviews (verified-purchase), staff moderation, banner + discount-code promos, static stores list, markdown help articles'],
      ['7', 'Polish & Production-Readiness', 'Skeletons everywhere, error boundaries, WCAG AA, Lighthouse ≥ 90/95/95, MailHog wired, README, Vitest + Jest coverage ≥ 70%, v1.0.0 tag'],
    ],
    [800, 2800, 5800],
  ),

  // 5. Tech Stack
  H1('5. Tech Stack'),
  P('The stack settled into the following — partly inherited from the scaffold, partly chosen for the locked scope.'),
  buildTable(
    ['Layer', 'Technology'],
    [
      ['Frontend framework', 'React 19 + TypeScript (strict) + Vite 8'],
      ['Styling', 'Tailwind CSS 4 (via @tailwindcss/vite, @theme tokens in src/index.css)'],
      ['State & data', 'Redux Toolkit 2 + RTK Query (custom envelope-unwrap baseQuery, 401-refresh interceptor)'],
      ['Forms', 'React Hook Form 7 + Yup 1'],
      ['Routing', 'React Router 7 (createBrowserRouter + lazy + Suspense)'],
      ['Toasts', 'sonner'],
      ['Icons', 'lucide-react (modern set), brand PNG for Argos logo'],
      ['Font', 'Barlow (matches argos.co.uk live CSS exactly)'],
      ['Backend framework', 'NestJS 10 + TypeScript'],
      ['ORM', 'Sequelize 6 + sequelize-typescript + @nestjs/sequelize'],
      ['Database', 'PostgreSQL 16 (native locally, Postgres-only features assumed)'],
      ['Cache', 'Redis 7 (used from Phase 3)'],
      ['Auth', 'JWT 15 min access in Authorization header + 7 d refresh in httpOnly cookie, bcrypt(rounds=12), token rotation'],
      ['Email', 'nodemailer → MailHog (dev), same env vars point at real SMTP in prod'],
      ['Image uploads', 'Multer + sharp → 3 sizes (300², 600², 1200²) at /static/uploads (no S3)'],
      ['Payments', 'Simulated processor (test card 4000000000000002 always fails) — no Stripe dependency'],
      ['Tooling', 'Husky 9 + lint-staged 15 + @commitlint/cli 19 (Conventional Commits)'],
      ['Formatter', 'Prettier 3 (semi:false, singleQuote, trailingComma:all, printWidth:100)'],
      ['Containerization', 'Docker Compose (postgres, redis, mailhog, server, client)'],
    ],
    [3000, 6400],
  ),

  new Paragraph({ children: [new PageBreak()] }),

  // 6. Delivered so far
  H1('6. What\'s Been Delivered'),

  H2('6.1 Phase 0 — Foundations'),
  Bullet('Initialised git repository on main branch with a single Conventional-Commits commit'),
  Bullet('Created 12 skill-rule markdown files in .warp/skills/ covering frontend, backend, DB, design tokens, pixel-perfect methodology, components, access control, admin panel, api contracts, testing, git workflow, QA acceptance'),
  Bullet('Wired Husky pre-commit (lint-staged → Prettier) and commit-msg (@commitlint/cli) hooks'),
  Bullet('Aligned docker-compose: postgres + redis + mailhog + server (port 4000) + client (port 3000)'),
  Bullet('Created .env.example with all required env vars + .gitattributes locking LF line endings'),
  Bullet('Pushed initial commit to https://github.com/Zeel18121996/argos.git via gh CLI'),

  H2('6.2 Phase 1 — Auth & Users (working end-to-end)'),
  Bullet('Backend migrations: users (with role check constraint), addresses, refresh_tokens, categories'),
  Bullet('Sequelize models: UserModel (with toPublicJSON helper), AddressModel, RefreshTokenModel'),
  Bullet('AuthService — register / login / refresh (rotates refresh token) / logout (revokes) / forgot-password / reset-password'),
  Bullet('JWT 15-minute access token + 7-day refresh stored as SHA-256 hash in refresh_tokens table'),
  Bullet('AuthController applies @nestjs/throttler limits: 5 / 5 min on login + register, 3 / 15 min on forgot-password'),
  Bullet('Refresh cookie is httpOnly + SameSite=Lax + Secure-in-prod, path=/api/v1/auth'),
  Bullet('UsersService with /me + /me/addresses CRUD; AdminService skeleton with users list + role/status patches'),
  Bullet('Seeder seeds 5 users: admin@argos.local, staff@argos.local, customer@argos.local, alice@example.com, bob@example.com (all Password123!)'),
  Bullet('Frontend baseApi auto-unwraps NestJS envelope + silent 401-refresh-and-retry-once interceptor'),
  Bullet('authApi RTK Query slice with register / login / refresh / logout / forgotPassword / resetPassword / getMe'),
  Bullet('AuthBootstrapper component runs once on app load to silently restore session from refresh cookie'),
  Bullet('Reusable form components: InputField (h-12), PasswordField (with "Show / Hide" text button — matches Argos), Checkbox'),
  Bullet('ProtectedRoute / StaffRoute / AdminRoute HOCs with role-based redirect and ?successUrl= support'),
  Bullet('LoginPage + RegisterPage redesigned multiple times to match argos.co.uk/login pixel-for-pixel — centered card, "Part of the family" divider with Argos / Tu / habitat wordmarks, "Sign in securely" green button, "New customers" outline button'),
  Bullet('Header account dropdown with click-outside / Escape / logout-clears-RTK-cache'),
  Bullet('Backend verified end-to-end via curl: health → login (admin/staff/customer) → /users/me → /admin/users → refresh → logout → blocked refresh after logout → 403 admin route as customer — all 12 cases pass'),

  H2('6.3 Argos-style design system'),
  Bullet('<header> wrapper mirrors Argos\'s computed CSS (Barlow, #333, sticky + z-61, no border/shadow)'),
  Bullet('Utility bar pixel-mirrored from .m-jtR / ._1JjmG / ._1II2j / ._3l0Ci including the ::before separator pipe'),
  Bullet('Argos PNG logo loaded from src/assets/argos-logo.png at responsive 49/60/70px max-widths'),
  Bullet('Search bar matches ._7blr5 / ._1Rz0y / ._2mKaC: h-44, pill-rounded left, dark-grey button on right with "Search" label in Barlow 16/600'),
  Bullet('Nav tabs (Shop / Trending / Summer of football) match Argos: Barlow 16/400, leading-19.2px, color #333, gap-30px, m-0 p-0 transparent'),
  Bullet('Ask Trevor green-gradient pill (linear-gradient #045228 → #008542) with sparkle icon + Trevor avatar SVG, ml-12px from search'),
  Bullet('Right icons (Account / Wishlist / Trolley) sized w-48/56/60, with text labels and a red #d42114 hover, green badge on Trolley'),
  Bullet('Promo strip below header with three circled-icon links (£ / % / Truck), 1px vertical separators, all uniform dark grey'),
  Bullet('Slider styled to Argos Fable .ds-c-slides spec: round 44px white nav arrows with shadow at 8px offset, pill-shaped active dot (32×12 in argos-blue), default 12×12 grey, 300ms linear transitions'),
  Bullet('Basket drawer z-index lifted above the sticky header (backdrop z-100, panel z-110), body-scroll-locked while open, Escape closes'),
  Bullet('Homepage hero replaced with Argos-Pay 0% Interest slide (red diagonal background, "Sony BRAVIA 7" product cluster on lg+, "From £X pm*" callouts)'),
  Bullet('Category strip uses rounded-square 88×88 tiles, with pinned "Argos Pay" / "Top 100 deals" / "Just for you" promo tiles before the dynamic categories'),
  Bullet('Per-slug Lucide icon mapping for category tiles (Tv, Sofa, Trees, Gamepad2, Baby, Sparkles, Dumbbell, Watch, Gift, Shirt, ChefHat, Wrench, HeartHandshake)'),

  H2('6.4 What\'s pending (Phases 2–7)'),
  Bullet('Phase 2 — Catalogue: Products / variants / images modules, browse with FTS, full PDP, admin product form with image uploader'),
  Bullet('Phase 3 — Basket & Wishlist: full Redis-backed guest baskets + merge-on-login, wishlist toggles'),
  Bullet('Phase 4 — Checkout & Orders: 3-step checkout, simulated payments, order tracking, admin orders'),
  Bullet('Phase 5 — Admin panel: dashboard stats, customers table + drawer, categories management'),
  Bullet('Phase 6 — Reviews, Promotions, Stores, Help'),
  Bullet('Phase 7 — Polish: Vitest + Jest tests, Lighthouse pass, README, v1.0.0 tag'),

  // 7. Lessons
  H1('7. Lessons Learned'),
  H3('7.1 Skills files compound over time'),
  P(
    'Every new skill file paid for itself five times over. The 30 minutes spent on git-workflow.md saved hours of "what commit type should I use" later. The same for testing.md, qa-acceptance.md, api-contracts.md. Future Claude turns read these automatically — the rules don\'t have to be re-stated each session.',
  ),

  H3('7.2 Plan mode is cheap and high-leverage'),
  P(
    'Five minutes spent in plan mode at the start prevented a lot of mid-build back-and-forth. The locked-in scope decisions (simulated payments, local /uploads, lean admin v1, static stores list) shaped every later phase and stopped scope creep.',
  ),

  H3('7.3 Pixel-perfect is achievable with the actual CSS'),
  P(
    'Eyeballing a screenshot gets you to 80%. Pasting Argos\'s own computed CSS into the chat and asking Claude to mirror it value-for-value gets you to 98%. The remaining 2% is licensed fonts (argos-web is proprietary — Barlow is the closest free match) and brand assets like the Trevor avatar.',
  ),

  H3('7.4 Conventional Commits + Husky give you a free changelog'),
  P(
    'A commit log of feat(auth): … / fix(basket): … / chore(deps): … / docs(skills): … is its own changelog. Anyone scanning git log immediately sees the shape of every change. Combined with one branch per phase, the repository history reads like the table of contents of the build itself.',
  ),

  H3('7.5 Vertical slices over horizontal layers'),
  P(
    'It\'s tempting to "do all the migrations first." Don\'t. Build Phase 1\'s migration + model + service + controller + DTO + seeder + frontend slice + e2e test, then move to Phase 2. Every phase finishing with a working demo is psychologically (and technically) much better than half-finished horizontal layers.',
  ),

  // Closing
  H1('8. Closing'),
  P(
    'The exercise demonstrated that Claude Code is genuinely capable of being a production-grade pair-programmer — not just for greenfield code, but for matching a sophisticated commercial design pixel-by-pixel when given the right inputs (skills files, the live CSS, screenshots). The output is in the repo at E:\\Code\\ArgosC and on GitHub at https://github.com/Zeel18121996/argos.',
  ),
  P('— Zeel Patel, May 2026', { run: { italics: true, color: SUBTLE } }),
]

const doc = new Document({
  creator: 'Zeel Patel',
  title: 'AI Acceleration Month — Vibe Coding: Argos Clone',
  description: 'Build journey of an argos.co.uk replica with Claude Code',
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 36, bold: true, font: FONT, color: ARGOS_RED },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: ARGOS_BLUE },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 24, bold: true, font: FONT, color: ARGOS_GREY },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: 'numbers',
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    },
  ],
})

const outPath = path.join(__dirname, 'AI-Acceleration-Vibe-Coding-Argos-Clone.docx')
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf)
  console.log('Wrote', outPath, '(' + buf.length + ' bytes)')
})
