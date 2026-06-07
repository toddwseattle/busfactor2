export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileUploadError";
  }
}

const readWithFileReader = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new FileUploadError("Could not read the uploaded file as text."));
    });
    reader.addEventListener("error", () => {
      reject(new FileUploadError("Could not read the uploaded file."));
    });

    reader.readAsText(file);
  });

export const readGitLogFile = async (file: File | null): Promise<string> => {
  if (file === null) {
    throw new FileUploadError("Choose a git log file to analyze.");
  }

  const text =
    typeof file.text === "function"
      ? await file.text()
      : await readWithFileReader(file);

  if (text.trim().length === 0) {
    throw new FileUploadError("The uploaded git log file is empty.");
  }

  return text;
};
