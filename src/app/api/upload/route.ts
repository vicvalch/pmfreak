import { randomUUID } from "node:crypto";
import { getAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCompanySubscription } from "@/lib/billing";
import { canUploadDocuments, getCompanyUsage, getUploadLimitForPlan, incrementUploadUsage } from "@/lib/usage-limits";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { appendOperationalMemory, extractOperationalMemoryCandidates } from "@/lib/operational-memory-v1";
import { enforceRuntimeAuthorization } from "@/lib/aoc/enterprise/runtime";
import { getUploadProvider, type StorageProvider } from "@/lib/storage/upload-provider";

type ExtractedFile = {
  fileName: string;
  contentType: string;
  size: number;
  extractedText: string;
  storageRef: string;
};

type UploadSuccessResponse = {
  ok: true;
  projectId: string;
  projectName: string;
  uploadedCount: number;
  uploadedFileNames: string[];
  ingestion: {
    startedAt: string;
    completedAt: string;
    status: "completed";
    extractedSignals: {
      risks: number;
      stakeholders: number;
    };
  };
  files: ExtractedFile[];
};

type UploadErrorResponse = {
  ok: false;
  error: string;
  code:
    | "UNAUTHORIZED"
    | "MALFORMED_MULTIPART"
    | "INVALID_PROJECT"
    | "MISSING_PROJECT"
    | "MISSING_FILES"
    | "INVALID_FILE_FIELD"
    | "INVALID_FILE_TYPE"
    | "FILE_TOO_LARGE"
    | "UPLOAD_LIMIT_REACHED"
    | "INGESTION_FAILED"
    | "TOO_MANY_FILES"
    | "TOTAL_SIZE_EXCEEDED";
};

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 10;
const MAX_TOTAL_SIZE_BYTES = 25 * 1024 * 1024;

const sanitizeFileName = (input: string) => input.replace(/[^a-zA-Z0-9._-]/g, "_");
const riskTerms = /\b(risk|blocker|delay|dependency|escalation)\b/gi;
const stakeholderTerms = /\b(stakeholder|owner|sponsor|team|vendor|client)\b/gi;

// Magic bytes for MIME spoofing defense (first 4 bytes checked)
const MAGIC: Record<string, Uint8Array> = {
  "application/pdf": new Uint8Array([0x25, 0x50, 0x44, 0x46]), // %PDF
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": new Uint8Array([0x50, 0x4b, 0x03, 0x04]), // PK\x03\x04
};

const verifyMagicBytes = (declared: string, header: Uint8Array): boolean => {
  const expected = MAGIC[declared];
  if (!expected) return true; // text/plain — no magic to check
  for (let i = 0; i < expected.length; i++) {
    if (header[i] !== expected[i]) return false;
  }
  return true;
};

const errorResponse = (status: number, error: UploadErrorResponse["error"], code: UploadErrorResponse["code"]) =>
  Response.json({ ok: false, error, code } satisfies UploadErrorResponse, { status });

const extractTextFromFile = async (file: File, buffer: Buffer): Promise<string> => {
  if (file.type === "text/plain") {
    return buffer.toString("utf-8").slice(0, 12000);
  }

  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.slice(0, 12000);
  }

  if (file.type === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text.slice(0, 12000);
  }

  return "";
};

const EXTRACTION_TIMEOUT_MS = 5000;

const extractWithTimeout = async (file: File, buffer: Buffer): Promise<string> => {
  const timeout = new Promise<string>((resolve) => {
    setTimeout(() => {
      console.warn("[upload] ingestion_timeout", { fileName: file.name, mimeType: file.type });
      resolve("");
    }, EXTRACTION_TIMEOUT_MS);
  });
  return Promise.race([extractTextFromFile(file, buffer), timeout]);
};

const rollbackUploads = async (provider: StorageProvider, refs: string[]): Promise<void> => {
  for (const ref of refs) {
    try {
      console.info("[upload] storage_rollback_attempted", { storageRef: ref });
      await provider.delete(ref);
    } catch (err) {
      console.error("[upload] storage_rollback_failed", {
        storageRef: ref,
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }
};

export async function POST(request: Request) {
  const user = await getAuthUser();

  if (!user) {
    return errorResponse(401, "Unauthorized", "UNAUTHORIZED");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(400, "Malformed multipart/form-data payload.", "MALFORMED_MULTIPART");
  }

  // Validate projectId format
  const projectId = (formData.get("projectId") ?? "").toString().trim();
  if (!projectId) {
    return errorResponse(400, "projectId is required.", "MISSING_PROJECT");
  }

  // Look up project BEFORE governance check (TOCTOU fix: governance runs on a confirmed project)
  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase.from("projects").select("id, name").eq("id", projectId).maybeSingle();
  if (!project) {
    return errorResponse(403, "Invalid project context.", "INVALID_PROJECT");
  }

  const governance = await enforceRuntimeAuthorization({
    actorType: "user",
    actorUserId: user.id,
    projectId,
    action: "document.upload",
    routeId: "/api/upload",
    resourceType: "document",
  });
  if (governance.response) {
    console.warn("[security] upload_project_access_denied", governance.decision);
    return errorResponse(403, "Invalid project context.", "INVALID_PROJECT");
  }

  const subscription = await getCompanySubscription(user.companyId);
  const usage = await getCompanyUsage(user.companyId);

  const incomingFiles = formData.getAll("documents");

  if (incomingFiles.length === 0) {
    return errorResponse(400, "At least one file is required in `documents` field.", "MISSING_FILES");
  }

  const files = incomingFiles.filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return errorResponse(400, "No valid files found in `documents` field.", "INVALID_FILE_FIELD");
  }

  // File count limit — checked before entering the loop
  if (files.length > MAX_FILES_PER_REQUEST) {
    return errorResponse(400, `Too many files. Maximum ${MAX_FILES_PER_REQUEST} files per request.`, "TOO_MANY_FILES");
  }

  // Total size limit — checked before entering the loop
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_SIZE_BYTES) {
    return errorResponse(400, "Total upload size exceeds 25MB limit.", "TOTAL_SIZE_EXCEEDED");
  }

  if (!canUploadDocuments(subscription.plan, usage.uploadCount, files.length)) {
    const limit = getUploadLimitForPlan(subscription.plan);
    return errorResponse(
      403,
      limit === null ? "Upload limit reached." : `Free plan limit reached (${limit} uploads/month). Upgrade to Pro for unlimited uploads.`,
      "UPLOAD_LIMIT_REACHED",
    );
  }

  const provider = getUploadProvider();
  const processedFiles: ExtractedFile[] = [];
  const uploadedRefs: string[] = [];
  const ingestionStartedAt = new Date().toISOString();
  console.info("[upload] upload_started", { userId: user.id, companyId: user.companyId, projectId, fileCount: files.length, fileNames: files.map((f) => f.name) });

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      console.warn("[upload] upload_failed", { reason: "invalid_file_type", projectId, fileName: file.name, fileType: file.type });
      await rollbackUploads(provider, uploadedRefs);
      return errorResponse(400, `Unsupported file type: ${file.name}`, "INVALID_FILE_TYPE");
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      console.warn("[upload] upload_failed", { reason: "file_too_large", projectId, fileName: file.name, fileSize: file.size });
      await rollbackUploads(provider, uploadedRefs);
      return errorResponse(400, `File too large: ${file.name}`, "FILE_TOO_LARGE");
    }

    // MIME spoofing defense — verify magic bytes before allocating full buffer
    const firstChunk = await file.slice(0, 8).arrayBuffer();
    const header = new Uint8Array(firstChunk);
    if (!verifyMagicBytes(file.type, header)) {
      console.warn("[upload] upload_failed", { reason: "magic_bytes_mismatch", projectId, fileName: file.name, declaredType: file.type });
      await rollbackUploads(provider, uploadedRefs);
      return errorResponse(400, `File content does not match declared type: ${file.name}`, "INVALID_FILE_TYPE");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileId = randomUUID();

    let storageRef: string;
    try {
      const result = await provider.upload({
        fileId,
        projectId: project.id,
        companyId: user.companyId,
        buffer,
        mimeType: file.type,
        originalName: file.name,
      });
      storageRef = result.storageRef;
      uploadedRefs.push(storageRef);
    } catch (storageError) {
      await rollbackUploads(provider, uploadedRefs);
      console.error("[upload] storage_upload_failed", {
        projectId,
        fileName: file.name,
        error: storageError instanceof Error ? storageError.message : "unknown",
      });
      return errorResponse(500, `Storage failed for ${file.name}.`, "INGESTION_FAILED");
    }

    const extractedText = await extractWithTimeout(file, buffer);

    processedFiles.push({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      extractedText,
      storageRef,
    });
  }

  await incrementUploadUsage(user.companyId, files.length);
  const allExtractedText = processedFiles.map((file) => file.extractedText).join("\n");
  const riskCount = (allExtractedText.match(riskTerms) ?? []).length;
  const stakeholderCount = (allExtractedText.match(stakeholderTerms) ?? []).length;
  const ingestionCompletedAt = new Date().toISOString();

  const uploadSource = processedFiles.map((file) => file.fileName).join(", ") || "upload";
  const extracted = extractOperationalMemoryCandidates({
    text: allExtractedText,
    sourceType: "upload",
    sourceReference: `upload:${uploadSource}`,
  });
  await appendOperationalMemory({
    companyId: user.companyId,
    projectId: project.id,
    entries: extracted,
  });
  console.info("[upload] ingestion_completed", {
    userId: user.id,
    companyId: user.companyId,
    projectId,
    uploadedCount: processedFiles.length,
    uploadedFileNames: processedFiles.map((file) => file.fileName),
    extractedSignals: { risks: riskCount, stakeholders: stakeholderCount },
  });

  return Response.json({
    ok: true,
    projectId: project.id,
    projectName: project.name.trim(),
    uploadedCount: processedFiles.length,
    uploadedFileNames: processedFiles.map((file) => file.fileName),
    ingestion: {
      startedAt: ingestionStartedAt,
      completedAt: ingestionCompletedAt,
      status: "completed",
      extractedSignals: { risks: riskCount, stakeholders: stakeholderCount },
    },
    files: processedFiles,
  } satisfies UploadSuccessResponse);
}
