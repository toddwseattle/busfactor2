import type { BusfactorReport } from "bus-lib";

interface CommitStatsTableProps {
  report: BusfactorReport;
}

export const CommitStatsTable = ({ report }: CommitStatsTableProps) => {
  if (report.commitStats.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="weekly-commits-heading">
      <h2 id="weekly-commits-heading">Weekly Commits</h2>
      <table>
        <caption>Weekly commits by author</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Total</th>
            {report.weeks.map((week) => (
              <th key={week} scope="col">
                {week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.commitStats.map((authorStats) => (
            <tr key={authorStats.author}>
              <th scope="row">{authorStats.author}</th>
              <td>{authorStats.totalCommits}</td>
              {authorStats.weeklyCommits.map((weeklyCount) => (
                <td key={weeklyCount.week}>{weeklyCount.count}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
