import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { REPORT_SCHEMA_VERSION } from "bus-lib";
import { App } from "./App.js";

describe("App", () => {
  it("renders the smoke UI from bus-lib exports", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Busfactor2" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Git log file")).toBeInTheDocument();
    expect(screen.getByText("Overall")).toBeInTheDocument();
    expect(screen.getByText("TS/JS/CSS")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Markdown")).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(REPORT_SCHEMA_VERSION)),
    ).toBeInTheDocument();
  });
});
