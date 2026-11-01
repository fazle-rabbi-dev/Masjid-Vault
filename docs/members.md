# Members feature - how it works

Doc for the member account system. Read this before touching `lib/auth.ts`, `app/actions/auth.ts`,
`app/actions/members.ts` or anything under `components/private/members/`.

Related: [spec](./spec.md) - section "Member accounts and permissions" and "Member management restrictions".

---

## 1. The core idea

There is **no public signup**. This is a closed system.

- The **admin** is not a database row. It comes from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env`.
- **Members** are database rows (`Member` model) created by the admin from the `/members` page.
- Everyone uses the **same login page** (`/`). Login tries env admin first, then the `Member` table.

So "giving access to a member" means:

1. Admin opens `/members`, clicks "Add member", fills name + username + password + permission.
2. The password is hashed (`lib/password.ts`, scrypt) and saved. Plain password is never stored.
3. Admin tells the member the username and password **outside the app** (in person, WhatsApp, etc).
4. Member logs in on `/` with those credentials.

There is no email sending, no invite link, no self-registration.

---

## 2. Data model

`prisma/schema.prisma`:

```prisma
model Member {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  name         String
  username     String   @unique
  passwordHash String
  permission   String   @default("READ_ONLY") // "READ_ONLY" | "READ_WRITE"
  status       String   @default("ACTIVE")    // "ACTIVE" | "INACTIVE"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  requests     ApprovalRequest[]
}
```

Notes:

- `permission` and `status` are plain strings in Mongo. The TypeScript types
  (`MemberPermission`, `MemberStatus` in `constants/auth.ts`) and the validators in
  `validations/member.ts` are what keep values honest. There is no DB enum.
- `username` is always stored **lowercase**. Validation forces it, and login lowercases the input.
- The admin account has no row here, so no member can ever edit, delete or promote the admin.

---

## 3. Login flow

File: `app/actions/auth.ts`

```
loginAction(username, password)
        |
        |-- empty field? -> "Username and password are required."
        |
        +-- username === env.ADMIN_USERNAME
        |   && password === env.ADMIN_PASSWORD
        |        |
        |        v
        |   createSession({ id: "admin", name: "Admin", role: "ADMIN" })
        |
        +-- else prisma.member.findUnique({ username: username.toLowerCase() })
                 |
                 +-- not found / status !== "ACTIVE" / password hash mismatch
                 |        -> "Invalid username or password."   (same message for all cases)
                 |
                 +-- ok -> createSession({
                             id: member.id,
                             name: member.name,
                             role: member.permission,
                         })
        |
        v
redirect("/dashboard")
```

Both tokens are httpOnly cookies:

| Cookie | Lifetime | Purpose |
|---|---|---|
| access token | 30 days | normal requests |
| refresh token | 35 days | lets `proxy.ts` mint a fresh access token |

---

## 4. Reading the session - the important part

File: `lib/auth.ts`

The JWT contains `role` and `name`, but for **members** we do not trust it. On every
`getSession()` call:

```
getSession()
   |
   +-- verify access cookie  ---> payload? use it
   +-- else verify refresh cookie -> payload? use it
   +-- else null

resolveSession(payload)
   |
   +-- payload.sub === "admin" ?
   |      role === "ADMIN" ? { id: "admin", role: "ADMIN" } : null
   |
   +-- else prisma.member.findUnique({ id: payload.sub })
          |
          +-- missing or status !== "ACTIVE" -> null   (kicked out immediately)
          |
          +-- else -> {
                  id: member.id,
                  name: member.name,           // fresh name
                  role: member.permission,     // fresh permission
              }
```

Why this matters:

```
Admin sets member A to INACTIVE
        |
        |  A's cookie is still cryptographically valid for up to 30 days
        v
Next request -> getSession() -> DB says INACTIVE -> null -> A is logged out
```

Same for permission changes: downgrade `READ_WRITE` to `READ_ONLY` and the next request
already sees the new role. This costs one Mongo lookup per request for members. Admin
costs nothing (no DB call).

`requireSession()` wraps `getSession()` and redirects to `/session/expired` when the result is null.

### Why `/session/expired` exists

A deactivated member still holds a valid cookie:

```
GET /dashboard
   |
proxy.ts sees a valid cookie, lets it through
   |
page calls requireSession() -> null
   |
   +-- if we redirected to "/" :
   |      proxy sees valid cookie on "/" -> redirects back to /dashboard -> LOOP
   |
   +-- we redirect to /session/expired :
          app/session/expired/route.ts
             clearSession()   (delete both cookies)
             redirect("/")    now there is no cookie, so no loop
```

Never change that redirect back to `"/"` without also handling cookie clearing.

---

## 5. The `/members` page (admin only)

```
app/(private)/members/page.tsx        server component
   |
   +-- requireSession()
   +-- role !== "ADMIN" -> redirect("/dashboard")
   +-- prisma.member.findMany({ orderBy: { createdAt: "desc" } })
   +-- map rows to MemberRow (id, name, username, permission, status, createdAt)
   |      passwordHash is NEVER passed to the client
   |
   v
components/private/members/members-list.tsx   client component
   |
   +-- <AddMemberDialog />          -> createMemberAction
   +-- row actions:
   |      Pencil          -> <EditMemberDialog />         -> updateMemberAction
   |      KeyRound        -> <ResetPasswordDialog />      -> resetMemberPasswordAction
   |      UserX / UserCheck -> setMemberStatusAction(id, status)
   |
   v
revalidatePath("/members") after every action -> list refreshes
```

Also: `constants/navigation.ts` has the Members entry with `adminOnly: true, enabled: true`,
so the sidebar only shows it to the admin. The page and the actions still guard themselves -
the hidden link is not security.

### Server actions

File: `app/actions/members.ts`. Every action starts the same way:

```ts
if (!(await isAdmin())) return { error: "Only the admin can ..." }
```

`isAdmin()` = `requireSession()` + `role === "ADMIN"`. There is no way for a member to call
these actions successfully, even by crafting the request.

| Action | Input | Result |
|---|---|---|
| `createMemberAction` | name, username, password, permission | new `Member`, status ACTIVE |
| `updateMemberAction` | memberId, name, username, permission | updates those fields only |
| `resetMemberPasswordAction` | memberId, password | new hash, old password dies |
| `setMemberStatusAction` | memberId, status | ACTIVE / INACTIVE toggle |

Duplicate usernames: we pre-check nothing, we just try the write and translate Prisma's
`P2002` (unique violation) into "That username is already taken." That also covers the race
where two admins submit the same username at once.

Actions call `requireSession()`, which may `redirect()`. That is fine inside a server action -
Next handles the redirect, it is not an error.

### Form handling on the client

`components/private/members/use-member-form.ts` is a small hook used by all three dialogs:

```
submit(formData)
   |
   +-- clear error
   +-- startTransition(async () => {
          result = await action(formData)
          |
          +-- "error" in result -> show <Alert variant="destructive">
          +-- success          -> onSuccess() -> dialog closes
       })
```

We deliberately do **not** use `useActionState` + `useEffect` here. Closing the dialog from an
effect calls `setState` synchronously inside an effect, which ESLint (`react-hooks/set-state-in-effect`)
rejects. The `useTransition` version has no such problem and still gives us `pending`.

Dialogs are keyed by member id (`key={editing?.id ?? "edit-none"}`) so switching members remounts
them and stale error messages do not leak between rows.

---

## 6. Validation rules

File: `validations/member.ts`

| Field | Rule |
|---|---|
| name | required, max 60 chars |
| username | 3-30 chars, `a-z 0-9 . _ -`, lowercased before saving |
| password | 6-72 chars (create + reset) |
| permission | must be `READ_ONLY` or `READ_WRITE` |
| status | must be `ACTIVE` or `INACTIVE` |

Helpers return `{ value }` or `{ error }` (type `Parsed<T>`), so the caller pattern is always:

```ts
const parsed = parseMemberCreate(formData)
if ("error" in parsed) return { error: parsed.error }
```

---

## 7. What a member can and cannot do (current state)

| | ADMIN | READ_WRITE | READ_ONLY |
|---|---|---|---|
| View dashboard, register, people, expenses, history, reports | yes | yes | yes |
| Add / edit / delete records directly | yes | no - goes to approval queue | no |
| See the Members page | yes | no (redirected) | no |
| Create / edit member accounts, reset passwords, toggle status | yes | no | no |

### People (contributor directory) guards

Files: `app/actions/people.ts`, `app/(private)/people/page.tsx`, `components/private/people/people-list.tsx`

```
createPerson / updatePerson / togglePerson / deletePerson
        |
        +-- requireSession()
        +-- !canWrite(role) -> redirect("/people")      // read-only: nothing happens
        |
        +-- role === "ADMIN"      -> write to Person table directly
        |
        +-- role === "READ_WRITE" -> prisma.approvalRequest.create({
                                       operation: CREATE | UPDATE | DELETE,
                                       entity: "PERSON",
                                       payload: proposed values,
                                       previous: snapshot before the change,
                                   })
```

The page hides the Add person button and the row action buttons when the viewer is read-only, and
shows a "Read only" badge. Write-enabled members see an info banner explaining their changes go
to the admin. The UI hiding is cosmetic - the `canWrite` check in the action is the real gate.

Approvals are not built yet. Write actions from members already create `ApprovalRequest` rows
(`app/actions/contributions.ts`, `app/actions/expenses.ts`, `app/actions/people.ts`), but nothing
reviews them yet. Until then a member-submitted person does not show up in the list, because the
real `Person` row is only created when the admin approves it.

---

## 8. Gotchas / things to remember

1. **Never send `passwordHash` to a client component.** The page maps rows to `MemberRow`
   (`types/members.ts`) for exactly this reason.
2. **`getSession()` is now async and hits Mongo** for members. Do not call it in a tight loop.
3. **The admin id is the literal string `"admin"`.** Any member id is an ObjectId, so they can
   never collide.
4. **Deactivate, do not delete.** `ApprovalRequest` has `onDelete: Cascade` on its member relation,
   so deleting a member erases their approval history. There is intentionally no delete button.
5. **Username case:** stored lowercase, login lowercases the input. The env admin username is
   matched as typed, so keep it lowercase in `.env` to avoid confusion.
6. **Adding a new member permission level** means touching: `constants/auth.ts`
   (`Role`, `MemberPermission`, `roleLabels`), `validations/member.ts`, and every place that
   checks `role` or `canWrite()`.
7. **The sidebar hides links, it does not protect them.** Every page needs its own
   `requireSession()` + role check, and every server action needs its own `canWrite()` / admin check.
   Use `canWrite(role)` for "may change financial data", `role === "ADMIN"` for member management.

---

## 9. Quick manual test

1. Log in as admin, open `/members`.
2. Add a member with `READ_ONLY`.
3. Log out, log in as that member. Members link is gone, `/members` redirects to `/dashboard`.
4. Log back in as admin, change them to `READ_WRITE`. As the member, refresh - write buttons appear
   without re-login.
5. As admin, deactivate them. As the member, click anything - you land on the login page
   with cookies cleared.
6. As a read-only member, open `/people` - no Add button, no row action icons, "Read only" badge.
7. As a read + write member, add a person - an info banner says it needs approval, and the person
   does not appear in the list until an admin approves the request.
