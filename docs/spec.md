# Masjid Fund Manager

Product requirements · MVP · Web application

## 1. App overview

A private, simple money management application for managing the mosque's monthly Imam salary contributions.

The application will replace the traditional paper-based collection register and provide a centralized place to:

- Maintain a list of people who contribute to the mosque.
- Track each person's monthly contribution.
- See who has paid and who hasn't.
- Track total collected funds and current available balance.
- Record expenses, such as Imam salary payments.
- Maintain a complete financial history.
- Generate printable monthly PDF reports.
- Allow authorized members to access and view financial records.
- Provide controlled member permissions and admin approval for operations.

Primary goal: Make mosque fund management transparent, organized, and easy to maintain without paperwork.

## 2. Authentication

The application should have a login page as its home page.

- Username and password authentication.
- Admin credentials are configured through environment variables.
- No public registration.
- Successful login redirects to the dashboard.
- Login session validity: 30 days.
- Refresh token validity: 35 days.
- Unauthenticated users cannot access the dashboard or other protected pages.
- Logout option.

### Member accounts and permissions

The admin should have the ability to create and manage member accounts from the application.

Each member should have:

- Name.
- Username.
- Password.
- Permission level.
- Account status (active/inactive).

There should be two member permission levels:

1\. Read-only permission

Members with read-only access can:

- Browse the dashboard.
- View contributors and their payment status.
- Browse monthly collection registers.
- View previous years' financial history.
- View contribution and expense history.
- View financial summaries.
- Download monthly PDF reports.

They cannot create, edit, or delete any records.

2\. Read + Write permission

Members with write permission can:

- Access everything available to read-only members.
- Submit requests to add new contributions.
- Submit requests to edit or delete existing contributions.
- Submit requests to add, edit, or delete expenses.
- Submit permitted requests to manage contributor records.

Important: Admin approval is mandatory.

Members with write permission cannot directly modify official records. Every create, update, or delete operation must first be submitted for admin approval.

### Admin approval workflow

```
Member performs an operation
          |
          v
   Pending approval
          |
          v
    Admin reviews it
          |
      +---+---+
      |       |
   Approve   Reject
      |       |
      v       v
 Official   No change
 record     to official
 updated    records
```

Every pending request should display:

- Requesting member.
- Requested operation.
- Affected record.
- Previous and proposed values, when applicable.
- Request date and time.
- Approve and reject actions.

Rejected requests should remain accessible in approval history.

### Member management restrictions

Only the admin can:

- Create new member accounts.
- Edit member information.
- Change member permissions.
- Activate or deactivate member accounts.
- Manage member roles.

Members must never be able to:

- Create new member accounts.
- Change their own permissions.
- Change another member's permissions.
- Promote themselves to admin.
- Modify admin account information or access.

## 3. Dashboard

The dashboard should provide an at-a-glance overview of the mosque's financial situation.

Financial overview cards:

- Available Balance: Total collected money minus total expenses.
- Total Collected: All contributions received.
- Total Expenses: All recorded spending.
- Current Month Collection: Total contributions received for the selected collection month.

Additional dashboard sections:

- Recent contribution activities.
- Recent expenses.
- Monthly collection progress.
- Quick actions to add a contribution, add an expense, and manage people.
- Current collection month indicator.
- Pending approval requests (visible to admin).

Dashboard actions should respect the logged-in member's permission level.

## 4. People management

Maintain a directory of everyone who contributes to the mosque fund.

People list:

- Person's name.
- Monthly promised contribution amount.
- Total amount contributed.
- Current month's payment status.
- Payment history.

Available actions:

- Add a new person.
- Edit person's information.
- Deactivate a person.
- View individual contribution history.

Important requirements:

- Each person should have a unique record.
- A person's previous payment history must remain available even if they become inactive.
- Monthly promised contribution amounts should be editable without changing historical records.
- Write-enabled members can submit contributor management requests for admin approval.

## 5. Monthly collection management

This is the application's primary feature.

The application should maintain a monthly collection register similar to the traditional paper register.

### Year-wise collection organization

Collection history should be organized by year, using a folder-like navigation structure.

Each year should act as a collection folder containing its twelve monthly registers.

Example:

2026

Current year

January

February

March

April

May

June

July

August

September

October

November

Current month

December

2025

2024

Illustrative year-wise collection navigation.

Requirements:

- Browse collection history by year.
- Expand a year to view its monthly registers.
- Select a month to view its collection details.
- Clearly identify the current year and collection month.
- Access previous years without losing historical records.
- Display yearly collection totals and expenses.
- Display yearly remaining balance.

### Monthly collection register

The application should maintain a table similar to the traditional paper register.

Example:

| Name  | January | February | March |
| ----- | ------- | -------- | ----- |
| Karim | 200     | 200      | 200   |
| Rahim | 200     | 0        | 200   |
| Hasan | 100     | 100      | 0     |
| Total | 500     | 300      | 400   |

- Each person's contribution should appear under the month it belongs to.
- Unpaid contributions should be clearly distinguishable from paid contributions.
- The register should show monthly totals.
- Users should be able to navigate between months and years.
- Users should be able to view previous months without losing historical records.
- The register should remain easy to read, even when the number of contributors increases.

### Multiple payments in the same month

If a person contributes multiple times during the same collection month, all payments should appear inside the same monthly cell.

For example, Karim pays ৳100 twice during November.

| Name  | November        |
| ----- | --------------- |
| Karim | 100 + 100 = 200 |

- The monthly cell should display the combined contribution amount.
- Individual payment entries should remain separately accessible.
- Users should be able to inspect each payment's amount, actual received date, and optional note.
- Multiple payments must not create duplicate contributor rows.
- The monthly total should include all payments received for that collection month.

### Current collection month

There must be an option to define the current collection month manually.

For example:

- Current collection month: November 2026.
- Actual collection period: November 28 – December 7.
- Money received during this period belongs to November's collection.

Important distinction:

Every contribution must maintain two separate dates:

1. Collection month: The month for which the money is being collected.
2. Received date: The actual date the money was received.

This distinction is essential because collections may happen in the following calendar month.

### Recording a contribution

When collecting money from someone, the user should be able to:

- Select a person.
- Select the collection month (default to the current collection month).
- Enter the amount received.
- Record the actual received date.
- Optionally add a note.

After recording, the person's payment status and the corresponding monthly total should update automatically once the operation is approved.

Contribution history should include:

- Contributor's name.
- Amount received.
- Collection month and year.
- Exact received date.
- Optional note.

The user should also be able to correct or edit an incorrectly recorded contribution while preserving an accurate financial history.

## 6. Expense management

Maintain a separate record of all money spent from the mosque fund.

Examples:

- Imam monthly salary.
- Other mosque-related expenses.
- Emergency expenses.

Expense record fields:

- Expense title.
- Amount.
- Expense date.
- Expense category.
- Optional description or note.

Available actions:

- Add an expense.
- Edit an expense.
- View expense history.
- Filter expenses by month.
- View total expenses.

When an expense is recorded and approved, the available balance should decrease automatically.

Write-enabled members must submit expense operations for admin approval.

## 7. Financial overview and history

The application must always provide an accurate financial overview.

Core financial calculations:

| Metric             | Description                                           |
| ------------------ | ----------------------------------------------------- |
| Total collected    | Sum of all received contributions                     |
| Total expenses     | Sum of all recorded expenses                          |
| Available balance  | Total collected − Total expenses                      |
| Monthly collection | Contributions assigned to a specific collection month |
| Monthly expenses   | Expenses recorded during a specific month             |
| Annual collection  | Contributions assigned to a specific year             |
| Annual expenses    | Expenses recorded during a specific year              |

The application should provide:

- All-time financial overview.
- Year-wise collection history.
- Month-wise collection history.
- Year-wise expense history.
- Month-wise expense history.
- Complete transaction history.
- Individual contributor payment history.

The user should be able to see where the money came from and where it was spent.

All financial summaries should reflect approved transactions only.

## 8. Monthly PDF report

The application must provide an option to download a monthly financial report as a PDF.

The PDF should be clean, professional, and suitable for printing and presenting to mosque members.

Report structure:

<!-- begin report structure -->

# MOSQUE FUND REPORT

November 2026

Monthly Financial Statement

1\. Monthly collection register

| Name  | Amount |
| ----- | ------ |
| Karim | 200    |
| Rahim | 200    |
| Hasan | 100    |
| Total | 500    |

2\. Collection summary

- Total collected: ৳500
- Number of contributors: 3
- Collection period: Nov 28 – Dec 7

3\. Expense history

| Description    | Amount |
| -------------- | ------ |
| Imam salary    | ৳400   |
| Total expenses | ৳400   |

4\. Financial summary

| Description       | Amount |
| ----------------- | ------ |
| Total collected   | ৳500   |
| Total expenses    | ৳400   |
| Remaining balance | ৳100   |

Generated from Mosque Fund Manager

<!-- end report structure -->

**PDF requirements:**

- Select a year and month and download its report.
- Include all contributions assigned to that collection month.
- Include relevant expenses recorded during that month.
- Include monthly totals and financial summary.
- Clearly distinguish unpaid contributors from paid contributors.
- Multiple payments should appear as a combined monthly amount.
- Include actual received dates where appropriate.
- A4 paper format.
- Print-friendly layout.
- Proper table alignment and readable typography.

## 9. UI screens

| Screen              | Main contents                                                           |
| ------------------- | ----------------------------------------------------------------------- |
| Login               | Username, password, login button                                        |
| Dashboard           | Financial overview, recent activities, current month                    |
| People              | Contributor directory, add/edit/deactivate                              |
| Monthly Register    | Year folders, month selector, contributor payment table, monthly totals |
| Add Contribution    | Person, month, amount, received date, note                              |
| Expenses            | Expense history, filters, total expenses                                |
| Add Expense         | Title, amount, date, category, description                              |
| Transaction History | Complete collection and expense records                                 |
| Reports             | Year/month selection and PDF download                                   |
| Members             | Member accounts, permissions, account status                            |
| Approvals           | Pending member requests, approve/reject actions                         |
| Approval History    | Previous approved and rejected requests                                 |
| Settings            | Current collection month, account/session settings                      |

## 10. Design direction

Design priority: Minimalism

The application should feel like a modern, lightweight financial management tool — not a complicated accounting dashboard.

Visual direction:

- Clean, minimal, professional interface.
- Green for successful payments and positive balances.
- Red for expenses and negative balances.
- Clear typography and comfortable spacing.

Important UI considerations:

- The monthly register is the most important screen. Prioritize its readability.
- Use a table-based layout similar to the existing paper register.
- Make payment status immediately recognizable.
- Keep year/month navigation simple and intuitive.
- Make multiple payments easy to inspect without cluttering the register.
- Keep frequently used actions easily accessible.
- Make the interface responsive for laptop and mobile screens.
- Clearly distinguish pending, approved, and rejected operations.
- Make permission-based actions easy to understand.
- Use subtle transitions for dialogs, dropdowns, and page navigation.
- Provide confirmation before destructive actions.
- Use clear empty states and success/error feedback.

## 11. Future features (not part of MVP)

Keep these possibilities in mind, but do not build them initially.

- Printable individual contribution statements.
- Yearly financial reports.
- Database backup and restore.
- Bengali language interface.

## 12. Important product rules

These rules are essential to the application's correctness.

1. Collection month and actual received date must always remain separate.
2. Historical contributions must never change when a person's promised monthly amount changes.
3. Inactive contributors must remain visible in historical reports.
4. Recording an approved contribution increases the available balance.
5. Recording an approved expense decreases the available balance.
6. Unpaid contributions must never be counted as collected money.
7. Editing or correcting transactions must keep financial totals accurate.
8. Monthly reports must reflect the selected collection month, not simply the calendar month in which money was received.
9. All financial records should remain accessible for future reference.
10. Collection history must be organized by year, with each year containing its twelve monthly registers.
11. Multiple payments by the same person in one month must appear together in a single monthly cell, while preserving individual payment records.
12. Only approved operations should affect official financial records and totals.
13. Every write operation submitted by a member requires admin approval.
14. Read-only members must not have any write capabilities.
15. Only the admin can create member accounts or change member permissions.
16. Members cannot modify admin accounts, member roles, or access permissions.
17. Rejected operations must not modify official records.

MVP success criteria: The admin and authorized members should be able to manage the mosque's entire monthly contribution collection, track expenses, check the available balance, browse year-wise financial history, review member-submitted operations, and generate printable financial reports without maintaining a separate paper register.
