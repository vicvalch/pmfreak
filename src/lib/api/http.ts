import { randomUUID } from "crypto";

export type ApiMeta = { requestId: string; version: string };
export type ApiErrorBody = { code: string; message: string; reason?: string; details?: unknown };

export function getRequestId(request: Request): string {
  const incoming = request.headers.get("x-request-id")?.trim();
  if (incoming && incoming.length <= 128 && /^[a-zA-Z0-9._:-]+$/.test(incoming)) return incoming;
  return randomUUID();
}

function withMeta(body: Record<string, unknown>, meta: ApiMeta, status = 200) {
  return Response.json({ ...body, meta }, { status, headers: { "x-request-id": meta.requestId } });
}

export const apiOk = <T>(data: T, meta: ApiMeta) => withMeta({ ok: true, data }, meta);
export const apiCreated = <T>(data: T, meta: ApiMeta) => withMeta({ ok: true, data }, meta, 201);
export const apiNoContent = (meta: ApiMeta) => new Response(null, { status: 204, headers: { "x-request-id": meta.requestId } });
export const apiError = (error: ApiErrorBody, meta: ApiMeta, status = 400) => withMeta({ ok: false, error }, meta, status);
export const apiPaginated = <T>(data: T[], pagination: { limit: number; nextCursor: string | null }, meta: ApiMeta) => withMeta({ ok: true, data, pagination }, meta);
export const apiUnauthorized = (meta: ApiMeta) => apiError({ code: "unauthorized", message: "Authentication required." }, meta, 401);
export const apiForbidden = (meta: ApiMeta, reason = "forbidden") => apiError({ code: "forbidden", message: "Access denied.", reason }, meta, 403);
export const apiNotFound = (meta: ApiMeta, resource = "resource") => apiError({ code: "not_found", message: `${resource} not found.` }, meta, 404);
export const apiValidationError = (meta: ApiMeta, details: unknown, message = "Validation failed.") => apiError({ code: "validation_error", message, details }, meta, 422);
