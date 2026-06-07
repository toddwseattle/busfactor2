import {
  createEmptyReport,
  DEFAULT_REPORT_SECTIONS,
  REPORT_SCHEMA_VERSION,
} from "bus-lib";

const report = createEmptyReport();

export const App = () => (
  <main>
    <header>
      <h1>Busfactor2</h1>
      <p>Smoke workspace for the shared analyzer, CLI, and web app.</p>
    </header>

    <section aria-labelledby="upload-heading">
      <h2 id="upload-heading">Upload</h2>
      <label htmlFor="git-log-upload">Git log file</label>
      <input id="git-log-upload" name="git-log-upload" type="file" />
    </section>

    <section aria-labelledby="sections-heading">
      <h2 id="sections-heading">Report Sections</h2>
      <ul>
        {DEFAULT_REPORT_SECTIONS.map((section) => (
          <li key={section.id}>{section.label}</li>
        ))}
      </ul>
    </section>

    <footer>
      <small>
        Schema: {REPORT_SCHEMA_VERSION}; sections: {report.sections.length}
      </small>
    </footer>
  </main>
);
