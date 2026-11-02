# Masjid Vault

A simple mosque fund manager for tracking monthly contributions, expenses, and reports.

> This is a vibe-coded app built without reviewing the code - it's for personal use, so neither following industry standards nor reviewing all the code was mandatory here.

## Features

- Track contributors and monthly payments
- Record expenses and see the available balance
- Browse financial history and printable reports
- Admin and read-only member access

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS and shadcn/ui
- MongoDB with Prisma
- JWT authentication with httpOnly cookies

## Getting started

```bash
bun install
bun db:generate
bun db:push
bun dev
```

Create a `.env` file with the variables defined in `lib/env.ts`:

```
DATABASE_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
```

Open [http://localhost:3000](http://localhost:3000) and sign in.
