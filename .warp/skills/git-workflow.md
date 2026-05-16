# Skill: Argos Clone — Git Workflow

## When to use this skill

Read this before any commit, branch operation, or PR. Especially when starting a new phase from the plan file.

---

## Branching Model

```
main      ← production-ready. Tagged releases only. Protected.
  └── develop          ← integration branch. All features land here first.
        ├── feature/phase-1-auth
        ├── feature/phase-2-products
        ├── fix/basket-qty-zero
        └── chore/upgrade-tailwind
```

Rules:

- Branch off **`develop`**, PR back to `develop`.
- `develop → main` only via a **release branch** (`release/v1.0.0`) at the end of each phase cluster (or at v1.0).
- Never commit directly to `main` or `develop`. Always go through a branch + PR (self-merge is fine in this solo project, but the audit trail still matters).
- Branch names: `feature/<short-kebab>`, `fix/<short-kebab>`, `chore/<short-kebab>`, `docs/<short-kebab>`.
- One phase = one feature branch (unless a phase needs sub-branches that merge into the phase branch first).

---

## Commit Messages — Conventional Commits

`<type>(<scope>)<!>: <short summary>`

| Type       | Use                                               |
| ---------- | ------------------------------------------------- |
| `feat`     | New user-facing functionality                     |
| `fix`      | Bug fix                                           |
| `chore`    | Tooling, config, deps                             |
| `docs`     | Docs / skill files / README only                  |
| `refactor` | Code change that doesn't add features or fix bugs |
| `test`     | Adding or updating tests                          |
| `style`    | Formatting only (Prettier)                        |
| `perf`     | Performance improvement                           |
| `build`    | Build system / package scripts                    |
| `ci`       | CI config                                         |

**Examples (good):**

```
feat(auth): add JWT refresh rotation with httpOnly cookie
fix(basket): prevent negative quantities on stepper rapid clicks
docs(skills): align frontend.md versions with current package.json
chore(deps): bump @nestjs/throttler from 6.2.1 to 6.4.0
test(products): cover sort-by-price-desc edge case with equal prices
```

**Examples (bad — reject these):**

```
update                    ← no type, no scope, no summary
fix stuff
WIP
feat: things and stuff
```

`<scope>` for this repo: a top-level module name where possible — `auth`, `products`, `basket`, `checkout`, `orders`, `admin`, `categories`, `payments`, `reviews`, `client`, `server`, `infra`, `skills`, `deps`. Use lowercase.

Breaking change: append `!` after scope **and** include `BREAKING CHANGE: <description>` in the body.

```
feat(api)!: switch checkout response shape to include order number

BREAKING CHANGE: clients must update OrderConfirmationPage to read `data.orderNumber`
not `data.order.id`.
```

---

## Husky + lint-staged + commitlint (Phase 0 setup)

Root `package.json` (created in Phase 0):

```json
{
  "name": "argos-clone",
  "private": true,
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.5.0",
    "@commitlint/config-conventional": "^19.5.0",
    "husky": "^9.1.6",
    "lint-staged": "^15.2.10"
  },
  "lint-staged": {
    "client/**/*.{ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
    "server/**/*.ts": ["eslint --fix --max-warnings=0", "prettier --write"],
    "**/*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

`commitlint.config.cjs`:

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'refactor', 'test', 'style', 'perf', 'build', 'ci'],
    ],
    'scope-empty': [2, 'never'],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
  },
}
```

Hooks (`.husky/`):

`.husky/pre-commit`:

```bash
npx lint-staged
```

`.husky/commit-msg`:

```bash
npx --no -- commitlint --edit "$1"
```

After cloning fresh: `npm install` at the root runs `prepare` and installs the hooks. The first time you set this up, run `npx husky init` once.

---

## When to commit

- One logical change per commit. Don't bundle a refactor with a new feature.
- Compile + test before committing. The pre-commit hook handles lint/format; you handle correctness.
- If a change spans backend + frontend (e.g. new endpoint + the slice that calls it), one commit is fine **provided the change is atomic** (works end-to-end after the commit). Otherwise, split.
- Don't commit `.env`, `uploads/`, anything in `node_modules/`. `.gitignore` covers them but check `git status` before adding.

---

## Pre-PR Checklist

Before opening the PR:

- [ ] Branch rebased on latest `develop` (`git fetch && git rebase origin/develop`)
- [ ] All commits Conventional-formatted (`git log --oneline` reads cleanly)
- [ ] No `console.log`/`debugger`/`TODO` left in shipped code
- [ ] `npm run lint` clean in both `client/` and `server/`
- [ ] `npm run test` clean in both
- [ ] If schema changed: a migration exists + `npm run migration:run` succeeds on a fresh DB
- [ ] Linked the relevant Phase in the PR description
- [ ] Read `qa-acceptance.md` for the phase and tick every applicable box

---

## PR Description Template

```markdown
## Phase

Phase X — <name from the plan file>

## What changed

- bullet
- bullet

## How to test

1. step
2. step

## Migrations / data

- new tables: ...
- new seeders: ...
- (or: no schema change)

## Screenshots (UI changes)

| Before | After |
| ------ | ----- |
| ...    | ...   |

## Acceptance — from `.warp/skills/qa-acceptance.md`

- [ ] Loads with skeleton state, never with raw empty UI
- [ ] Renders real data
- [ ] Empty / error state handled
- [ ] Responsive at 360 / 768 / 1280
- [ ] Keyboard-navigable, focus-visible on every interactive element
- [ ] No console errors in browser devtools during the test flow
```

---

## Releasing

End-of-phase-cluster (or v1.0):

```bash
git checkout develop
git pull
git checkout -b release/v1.0.0
# bump versions in root + client + server package.json
# update CHANGELOG.md (manual is fine for this project)
git commit -m "chore(release): v1.0.0"
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "v1.0.0"
git push origin main --tags
git checkout develop
git merge --no-ff release/v1.0.0
git push origin develop
git branch -d release/v1.0.0
```

---

## Common Pitfalls

- **Never `--no-verify`.** If a hook fails, fix the underlying issue. The hook exists for a reason.
- **Never force-push to `main` or `develop`.** Force-push only to your own feature branch _and only after a rebase you understand_.
- **Don't amend a pushed commit.** Make a new commit. Amend is only safe on commits that haven't left your machine.
- **Don't commit binaries or generated files.** `dist/`, `build/`, `coverage/`, `node_modules/`, `uploads/`, `*.tsbuildinfo` are already ignored — verify before adding.
- **Don't use `git add -A` or `git add .`.** Add by path (`git add server/src/auth/`) to avoid accidentally including a stray `.env.local` or scratch file.
- **Don't commit changes to `package-lock.json` blindly.** If `npm install` added a lock-file diff you didn't expect, investigate.
