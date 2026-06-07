import type { BusfactorReport } from "bus-lib";

export const formatJsonReport = (report: BusfactorReport): string =>
  JSON.stringify(report, null, 2);
