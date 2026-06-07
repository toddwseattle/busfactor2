import type { BusfactorReportSection } from "bus-lib";
import { formatDate, formatPercent } from "../lib/format.js";

interface BusFactorSectionProps {
  authors: readonly string[];
  section: BusfactorReportSection;
}

export const BusFactorSection = ({
  authors,
  section,
}: BusFactorSectionProps) => (
  <section aria-labelledby={`${section.id}-heading`}>
    <h3 id={`${section.id}-heading`}>{section.label}</h3>
    <p>
      {section.totalFiles} files, {section.riskFiles} risky
    </p>

    {section.files.length === 0 ? (
      <p>No files in this section.</p>
    ) : (
      <table>
        <caption>{section.label} bus factor files</caption>
        <thead>
          <tr>
            <th scope="col">File</th>
            <th scope="col">Total edits</th>
            <th scope="col">Active contributors</th>
            <th scope="col">Risk</th>
            {authors.map((author) => (
              <th key={author} scope="col">
                {author}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.files.map((file) => (
            <tr className={file.isRisk ? "is-risk" : undefined} key={file.path}>
              <th scope="row">{file.path}</th>
              <td>{file.totalEdits}</td>
              <td>
                {file.activeContributorCount} of {file.riskContributorThreshold}
              </td>
              <td>{file.isRisk ? "yes" : "no"}</td>
              {file.contributors.map((contributor) => (
                <td
                  className={
                    contributor.isActive ? undefined : "is-low-contribution"
                  }
                  key={contributor.author}
                >
                  <div>{formatPercent(contributor.contributionPercent)}</div>
                  <div>
                    {contributor.editCount}{" "}
                    {contributor.editCount === 1 ? "edit" : "edits"}
                  </div>
                  <div>{contributor.isActive ? "active" : "low"}</div>
                  <div>Last edited {formatDate(contributor.lastEditedAt)}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </section>
);
