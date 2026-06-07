import { useEffect, useState, type ChangeEvent } from "react";

interface UploadPanelProps {
  errorMessage: string | null;
  fileName: string | null;
  hasReport: boolean;
  isLoading: boolean;
  onFileSelected: (file: File | null) => void;
}

export const UploadPanel = ({
  errorMessage,
  fileName,
  hasReport,
  isLoading,
  onFileSelected,
}: UploadPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(!hasReport);
  }, [hasReport]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.currentTarget.files?.[0] ?? null;
    onFileSelected(file);
    event.currentTarget.value = "";
  };

  return (
    <section aria-labelledby="upload-heading">
      <h2 id="upload-heading">Commit Log Analyzer</h2>
      <button
        aria-controls="upload-panel"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {isOpen ? "Close upload" : "Open upload"}
      </button>

      {isOpen ? (
        <div id="upload-panel">
          <p>
            Upload the git log for your main branch after running this command:
          </p>
          <pre>
            <code>
              git log --no-merges --name-status main &gt; ~/gitlog.txt
            </code>
          </pre>
          <label htmlFor="git-log-upload">Git log file</label>
          <input
            accept=".txt,.log,text/plain"
            disabled={isLoading}
            id="git-log-upload"
            name="git-log-upload"
            onChange={handleChange}
            type="file"
          />
        </div>
      ) : null}

      <div aria-live="polite">
        {isLoading ? <p>Analyzing uploaded git log...</p> : null}
        {errorMessage === null && fileName !== null && !isLoading ? (
          <p>Analyzed {fileName}.</p>
        ) : null}
        {errorMessage !== null ? <p>{errorMessage}</p> : null}
      </div>
    </section>
  );
};
