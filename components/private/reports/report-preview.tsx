import { formatCurrency, formatMonth, formatShortDate } from "@/lib/format"
import { getMonthShortName } from "@/constants/register"
import type { ReportData } from "@/types/reports"

type ReportPreviewProps = {
  data: ReportData
}

export function ReportPreview({ data }: ReportPreviewProps) {
  const monthLabel = formatMonth(data.year, data.month)
  const paidPeople = data.people.filter((person) => person.paid > 0)
  const unpaidPeople = data.people.filter(
    (person) => person.active && person.paid <= 0
  )
  const inactivePeople = data.people.filter((person) => !person.active)

  const period =
    data.firstReceivedAt && data.lastReceivedAt
      ? `${formatShortDate(new Date(data.firstReceivedAt))} - ${formatShortDate(
          new Date(data.lastReceivedAt)
        )}`
      : "-"

  return (
    <div id="report-content" className="report-space rounded-xl bg-white p-6">
      <header className="report-header">
        <h1 className="report-title">MOSQUE FUND REPORT</h1>
        <p className="report-subtitle">{monthLabel}</p>
        <p className="report-muted text-sm">Monthly Financial Statement</p>
      </header>

      <section className="report-section">
        <h2 className="report-heading">1. Monthly collection register</h2>
        {paidPeople.length === 0 ? (
          <p className="report-muted text-sm">
            No contributions recorded for this month.
          </p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paidPeople.map((person) => (
                <tr key={person.id}>
                  <td>{person.name}</td>
                  <td className="text-right">
                    {formatCurrency(person.paid)}
                  </td>
                </tr>
              ))}
              <tr className="report-total-row">
                <td>Total</td>
                <td className="text-right">
                  {formatCurrency(data.collected)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      <section className="report-section">
        <h2 className="report-heading">2. Collection summary</h2>
        <ul className="report-list">
          <li>
            <span>Total collected</span>
            <span>{formatCurrency(data.collected)}</span>
          </li>
          <li>
            <span>Number of contributors</span>
            <span>{data.paidPeople}</span>
          </li>
          <li>
            <span>Collection period</span>
            <span>{period}</span>
          </li>
        </ul>
      </section>

      <section className="report-section">
        <h2 className="report-heading">3. Expense history</h2>
        {data.expenses.length === 0 ? (
          <p className="report-muted text-sm">
            No expenses recorded for this month.
          </p>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.title}</td>
                  <td className="text-right">
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              ))}
              <tr className="report-total-row">
                <td>Total expenses</td>
                <td className="text-right">
                  {formatCurrency(data.expenseTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      <section className="report-section">
        <h2 className="report-heading">4. Financial summary</h2>
        <table className="report-table">
          <tbody>
            <tr>
              <td>Total collected</td>
              <td className="text-right">
                {formatCurrency(data.collected)}
              </td>
            </tr>
            <tr>
              <td>Total expenses</td>
              <td className="text-right">
                {formatCurrency(data.expenseTotal)}
              </td>
            </tr>
            <tr className="report-total-row">
              <td>Remaining balance</td>
              <td className="text-right">
                {formatCurrency(data.balance)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {(unpaidPeople.length > 0 || inactivePeople.length > 0) && (
        <section className="report-section">
          <h2 className="report-heading">5. Payment status</h2>
          {unpaidPeople.length > 0 ? (
            <div className="mb-3">
              <p className="mb-1 text-sm font-medium">Unpaid contributors</p>
              <p className="report-muted text-sm">
                {unpaidPeople.map((person) => person.name).join(", ")}
              </p>
            </div>
          ) : null}
          {inactivePeople.length > 0 ? (
            <div>
              <p className="mb-1 text-sm font-medium">Inactive contributors</p>
              <p className="report-muted text-sm">
                {inactivePeople.map((person) => person.name).join(", ")}
              </p>
            </div>
          ) : null}
        </section>
      )}

      <footer className="report-footer">
        <p>Generated from Masjid Vault</p>
        <p className="report-muted text-xs">
          Collection month: {getMonthShortName(data.month)} {data.year}
        </p>
      </footer>
    </div>
  )
}
