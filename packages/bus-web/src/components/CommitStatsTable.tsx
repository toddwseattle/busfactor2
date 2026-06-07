import type { AuthorCommitStats } from "bus-lib";

interface CommitStatsTableProps {
  commitStats: AuthorCommitStats[];
  weeks: string[];
}

const formatCount = (count: number) => count.toLocaleString("en-US");

const formatCommitLabel = (count: number) =>
  `${formatCount(count)} ${count === 1 ? "commit" : "commits"}`;

const formatWeekLabel = (count: number) =>
  `${formatCount(count)} ${count === 1 ? "commit" : "commits"}`;

const intensityClassForCount = (count: number, maxCount: number) => {
  if (count === 0 || maxCount === 0) {
    return "bg-[#f6f2eb] text-[#62576f]";
  }

  const ratio = count / maxCount;
  if (ratio >= 0.75) {
    return "bg-[#4e2a84] text-white";
  }
  if (ratio >= 0.5) {
    return "bg-[#8366aa] text-white";
  }
  return "bg-[#d8c9ed] text-[#221635]";
};

export const CommitStatsTable = ({
  commitStats,
  weeks,
}: CommitStatsTableProps) => {
  const maxWeeklyCount = commitStats.reduce(
    (maxCount, authorStats) =>
      Math.max(
        maxCount,
        ...authorStats.weeklyCommits.map((entry) => entry.count),
      ),
    0,
  );

  return (
    <section
      aria-labelledby="weekly-commits-heading"
      className="rounded-lg border border-[#d8d0c4] bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4e2a84]">
            Commit activity
          </p>
          <h2
            id="weekly-commits-heading"
            className="mt-2 text-2xl font-semibold text-[#221635]"
          >
            Weekly commits
          </h2>
        </div>
        <p className="text-sm font-medium text-[#62576f]">
          {formatCount(weeks.length)} active{" "}
          {weeks.length === 1 ? "week" : "weeks"}
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <caption className="sr-only">
            Weekly commits by author and report week
          </caption>
          <thead>
            <tr className="border-b border-[#d8d0c4] text-xs uppercase tracking-[0.14em] text-[#62576f]">
              <th className="min-w-48 py-3 pr-4 font-semibold" scope="col">
                Author
              </th>
              <th className="min-w-24 px-3 py-3 font-semibold" scope="col">
                Total
              </th>
              {weeks.map((week) => (
                <th
                  className="min-w-28 px-3 py-3 font-semibold"
                  key={week}
                  scope="col"
                >
                  {week}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ece4d8]">
            {commitStats.map((authorStats) => {
              const commitsByWeek = new Map(
                authorStats.weeklyCommits.map((entry) => [
                  entry.week,
                  entry.count,
                ]),
              );

              return (
                <tr key={authorStats.author}>
                  <th
                    className="py-3 pr-4 font-semibold text-[#34214f]"
                    scope="row"
                  >
                    {authorStats.author}
                  </th>
                  <td
                    aria-label={`${authorStats.author} total commits: ${formatCommitLabel(
                      authorStats.totalCommits,
                    )}`}
                    className="px-3 py-3 font-semibold text-[#221635]"
                  >
                    {formatCount(authorStats.totalCommits)}
                  </td>
                  {weeks.map((week) => {
                    const count = commitsByWeek.get(week) ?? 0;
                    return (
                      <td
                        aria-label={`${authorStats.author}, week ${week}: ${formatWeekLabel(
                          count,
                        )}`}
                        className="px-3 py-3"
                        key={week}
                      >
                        <span
                          className={`inline-flex min-w-10 justify-center rounded-md px-3 py-1.5 font-semibold ${intensityClassForCount(
                            count,
                            maxWeeklyCount,
                          )}`}
                        >
                          {formatCount(count)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
