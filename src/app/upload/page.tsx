"use client";

import { DragEvent, useMemo, useState } from "react";

type UploadResponseFile = {
  fileName: string;
  contentType: string;
  size: number;
  extractedText: string;
};

type UploadResponse = {
  projectName: string;
  files: UploadResponseFile[];
};

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function UploadPage() {
  const [projectName, setProjectName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);

  const projectNameIsValid = projectName.trim().length > 0;

  const canUpload = useMemo(
    () => projectNameIsValid && selectedFiles.length > 0 && !isUploading,
    [projectNameIsValid, selectedFiles.length, isUploading],
  );

  const validateFiles = (incomingFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    incomingFiles.forEach((file) => {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        errors.push(`\"${file.name}\" is not a supported format.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(
          `\"${file.name}\" exceeds the 10 MB size limit (${formatFileSize(file.size)}).`,
        );
        return;
      }

      validFiles.push(file);
    });

    setValidationErrors(errors);
    setUploadError(null);
    setUploadResult(null);
    setSelectedFiles(validFiles);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    validateFiles(droppedFiles);
  };

  const handleUpload = async () => {
    if (!canUpload) {
      return;
    }

    const formData = new FormData();
    formData.append("projectName", projectName.trim());

    selectedFiles.forEach((file) => {
      formData.append("documents", file);
    });

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as UploadResponse | { error: string };

      if (!response.ok || "error" in payload) {
        setUploadResult(null);
        setUploadError("error" in payload ? payload.error : "Upload failed.");
        return;
      }

      setUploadResult(payload);
    } catch {
      setUploadError("Unable to upload right now. Please try again.");
      setUploadResult(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
      <main className="mx-auto w-full max-w-4xl space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-12">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">ScopeGuard AI • Sprint 2</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Document Intake</h1>
          <p className="text-sm text-slate-300 md:text-base">
            Upload PDF, DOCX, or TXT files and preview extracted content before policy analysis.
          </p>
        </div>

        <section className="space-y-3">
          <label htmlFor="project-name" className="text-sm font-medium text-slate-200">
            Project Name
          </label>
          <input
            id="project-name"
            name="projectName"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="Acme Vendor Contract Review"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none ring-cyan-300/50 placeholder:text-slate-400 focus:ring"
          />
        </section>

        <section className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
              isDragging
                ? "border-cyan-300 bg-cyan-300/10"
                : "border-white/20 bg-slate-900/40 hover:border-cyan-200/60"
            }`}
          >
            <p className="text-base font-medium">Drag & drop documents here</p>
            <p className="mt-1 text-sm text-slate-300">or select from your device</p>
            <label className="mt-5 inline-flex cursor-pointer rounded-full border border-cyan-300/60 px-5 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/10">
              Choose Files
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={(event) => validateFiles(Array.from(event.target.files ?? []))}
                className="sr-only"
              />
            </label>
            <p className="mt-4 text-xs text-slate-400">Accepted: PDF, DOCX, TXT • Max 10 MB per file</p>
          </div>

          {validationErrors.length > 0 ? (
            <ul className="space-y-1 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {validationErrors.map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
          ) : null}

          {selectedFiles.length > 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <h2 className="text-sm font-medium text-slate-200">Selected Files ({selectedFiles.length})</h2>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">
                {selectedFiles.map((file) => (
                  <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-3">
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-slate-400">{formatFileSize(file.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!canUpload}
            className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-300 px-6 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {isUploading ? "Uploading..." : "Upload Documents"}
          </button>

          {uploadError ? (
            <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {uploadError}
            </p>
          ) : null}
        </section>

        {uploadResult ? (
          <section className="space-y-4 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-5">
            <h2 className="text-lg font-semibold text-emerald-100">Extracted Preview</h2>
            <p className="text-sm text-emerald-50">
              Project: <span className="font-medium">{uploadResult.projectName}</span>
            </p>
            <div className="space-y-4">
              {uploadResult.files.map((file) => (
                <article key={file.fileName} className="rounded-xl border border-white/20 bg-black/20 p-4">
                  <h3 className="text-sm font-semibold text-white">{file.fileName}</h3>
                  <p className="mt-1 text-xs text-slate-300">{file.contentType}</p>
                  <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950/80 p-3 text-xs text-slate-200">
                    {file.extractedText || "No readable text was extracted from this file."}
                  </pre>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
