> Do not read the `.env` file. All environment variables are exported from `lib/env.ts`. Always import from there, never from `process.env` directly.

## Overview

**Special and Important:** For entire project spec refer to this doc: [app-spec](./docs/spec.md)

---

## Tech Stack

- **Framework:** React-19 and Next.js 16 (App Router)
- **Runtime:** Node.js with TypeScript
- **Styling:** TailwindCSS & ShadCN
- **Animation:** Framer motion aka motion
- **Global State Management:** Zustand
- **HTTP Client:** Fetch API
- **Package Manager:** Bun (only)
- **Authentication:** admin credentials stored in `.env` file and check user input credentails against stored credentials. If credentials are valid, JWT is generated and stored access-token and refresh-token in cookies as httpOnly.
- **DB:** Mongodb with Prisma

> generate JWT (access token, short-lived, e.g. 30day)
> generate JWT (refresh token, long-lived, e.g. 35days)

## Folder Structure

> **Note:** read the folder tree for all present folders & files, only when you need to know what files present inside a specific folder.

## Rules

- Utilize react-19's new features when appropriate
- Don't use memo, useMemo, useCallback, forwardRef, etc
- Follow Next.js App Router conventions
- Implement proper error handling and loading states
- Use React Server Components where possible
- Handle authentication state consistently across the app
- Keep components small and focused
- Use proper SEO practices
- When need a pkg -> first check if it's already in `package.json` and if not, install it via `bun add` but ask permission before installing any pkg
- Use react19 & nextjs best practices. e.g: `custom hooks`, `api helper` etc.
- Im a perfectionist, but now trying to become minimalist and keep things simple and want to kill perfectionism and ship faster. So, don't make me confuse when answering questions.
- Do not over-engineer stuffs, keep it simple always by focusing only what matters most, and implement stufss in easy way when possible instead of over-engineering.
- Separate pkg import and custom file import by leaving a blank line between them
- When do linting/type check than only check on the changed files
- Do not write console.log() instead use custom logger that available at `src/lib/logger.ts`
- When to many code in a file write good `comment` for readability; especially for the large jsx code
- Don't use em-dash when you generate text instead use plain hyphen `(-)`

## Good to know

- Admin pages can be client-side rendered
- Prioritize modular architecture
- Make web search when you need additional info

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Also refer to: [Nextjs 16 Pattern](.agents/skills/ui-design/references/nextjs-16-pattern.md)

<!-- END:nextjs-agent-rules -->

## Environment Variables

> export necessary vars from lib/env.ts than i will fill .env file
