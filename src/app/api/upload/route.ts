import { getAuthUser } from "@/lib/auth";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

type ExtractedFile = {
  fileName: string;
  contentType: string;
  size: number;
  extractedText: string;
  savedTo: string;
};

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const sanitizeFileName = (input: string) => input.replace(/[^a-zA-Z0-9._-]/g, "_");

const extractTextFromFile = async (file: File, buffer: Buffer) => {
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

export async function POST(request: Request) {
  const user = await getAuthUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const projectName = (formData.get("projectName") ?? "").toString().trim();
  const incomingFiles = formData.getAll("documents");

  if (!projectName) {
    return Response.json({ error: "Project name is required." }, { status: 400 });
  }

  if (incomingFiles.length === 0) {
    return Response.json({ error: "At least one file is required." }, { status: 400 });
  }

  const files = incomingFiles.filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return Response.json({ error: "No valid files found in request." }, { status: 400 });
  }

  const projectSlug = sanitizeFileName(projectName.toLowerCase().replace(/\s+/g, "-"));
  const uploadDir = path.join(process.cwd(), "uploads", projectSlug);
  await mkdir(uploadDir, { recursive: true });

  const processedFiles: ExtractedFile[] = [];

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return Response.json({ error: `Unsupported file type: ${file.name}` }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json({ error: `File too large: ${file.name}` }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = sanitizeFileName(file.name);
    const filePath = path.join(uploadDir, `${Date.now()}-${safeName}`);

    await writeFile(filePath, buffer);

    const extractedText = await extractTextFromFile(file, buffer);

    processedFiles.push({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      extractedText,
      savedTo: filePath,
    });
  }

  return Response.json({
    projectName,
    files: processedFiles,
  });
}
