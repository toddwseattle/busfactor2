import { describe, expect, it } from "vitest";
import {
  createEmptyReport,
  DEFAULT_SECTION_IDS,
  REPORT_SCHEMA_VERSION,
} from "./index.js";

describe("bus-lib smoke exports", () => {
  it("exposes the required default report section ids", () => {
    expect(DEFAULT_SECTION_IDS).toEqual([
      "overall",
      "ts-js-css",
      "python",
      "markdown",
    ]);
  });

  it("creates a deterministic empty report", () => {
    const report = createEmptyReport();

    expect(report).toMatchInlineSnapshot(`
      {
        "authors": [],
        "commitStats": [],
        "generatedAt": "1970-01-01T00:00:00.000Z",
        "options": {
          "activeThreshold": 0.05,
          "halfLifeDays": 7,
          "riskContributorCount": 3,
        },
        "schemaVersion": "busfactor.report.v1",
        "sections": [
          {
            "id": "overall",
            "label": "Overall",
            "riskFiles": 0,
            "totalFiles": 0,
          },
          {
            "id": "ts-js-css",
            "label": "TS/JS/CSS",
            "riskFiles": 0,
            "totalFiles": 0,
          },
          {
            "id": "python",
            "label": "Python",
            "riskFiles": 0,
            "totalFiles": 0,
          },
          {
            "id": "markdown",
            "label": "Markdown",
            "riskFiles": 0,
            "totalFiles": 0,
          },
        ],
        "source": {
          "mode": "git-log",
        },
        "summary": {
          "riskFiles": 0,
          "totalFiles": 0,
        },
        "weeks": [],
      }
    `);
    expect(report.schemaVersion).toBe(REPORT_SCHEMA_VERSION);
  });
});
