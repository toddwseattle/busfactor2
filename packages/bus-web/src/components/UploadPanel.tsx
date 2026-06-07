interface UploadPanelProps {
  isLoading: boolean;
  onUpload: (file: File) => void;
}

export const UploadPanel = ({ isLoading, onUpload }: UploadPanelProps) => (
  <section
    aria-labelledby="upload-heading"
    className="rounded-lg border border-[#d8d0c4] bg-white p-5 shadow-sm"
  >
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4e2a84]">
        Git log input
      </p>
      <h2
        id="upload-heading"
        className="mt-2 text-2xl font-semibold text-[#221635]"
      >
        Upload a git log text file
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#62576f]">
        Choose a plain text git log export. Busfactor2 analyzes it in the
        browser with the shared library.
      </p>
    </div>

    <div className="mt-5 flex flex-col gap-3 rounded-md border border-dashed border-[#b6a7c8] bg-[#fbfaf7] p-4">
      <label
        htmlFor="git-log-upload"
        className="text-sm font-semibold text-[#34214f]"
      >
        Git log file
      </label>
      <input
        id="git-log-upload"
        name="git-log-upload"
        type="file"
        accept=".txt,.log,text/plain"
        disabled={isLoading}
        aria-describedby="upload-help"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file !== undefined) {
            onUpload(file);
          }
          event.currentTarget.value = "";
        }}
        className="block w-full cursor-pointer rounded-md border border-[#cfc5db] bg-white text-sm text-[#34214f] file:mr-4 file:border-0 file:bg-[#4e2a84] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:outline-none focus:ring-2 focus:ring-[#b6a7c8] disabled:cursor-not-allowed disabled:opacity-70"
      />
      <p id="upload-help" className="text-sm text-[#62576f]">
        The app reads the file locally; it does not run git commands.
      </p>
    </div>
  </section>
);
