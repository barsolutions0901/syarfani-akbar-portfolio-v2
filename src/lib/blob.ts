import "server-only";

import { del, list, put } from "@vercel/blob";

export type BlobUploadBody = Parameters<typeof put>[1];

export type BlobUploadOptions = {
  folder?: string;
  contentType?: string;
  access?: "public" | "private";
};

/**
 * The Vercel Blob write token is read server-side by the SDK from
 * BLOB_READ_WRITE_TOKEN. It must NEVER be sent to the browser. Each accessor
 * below checks it explicitly so a missing/empty token yields a clear, structured
 * configuration error instead of an opaque crash. The token value itself is
 * never included in any error message.
 */
function assertWriteTokenConfigured() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new UploadError(
      "BLOB_READ_WRITE_TOKEN is not configured. Upload is unavailable until this Vercel Blob token is set in the server environment.",
    );
  }
}

export class UploadError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

/**
 * Single-provider file storage wrapper around Vercel Blob.
 */
export async function uploadFile(
  filename: string,
  body: BlobUploadBody,
  options: BlobUploadOptions = {},
) {
  assertWriteTokenConfigured();

  const { folder, contentType, access = "public" } = options;
  const path = folder ? `${folder}/${filename}` : filename;

  return put(path, body, {
    contentType,
    access,
  });
}

export async function deleteFile(url: string) {
  assertWriteTokenConfigured();
  await del(url);
}

export async function listFiles(folder?: string) {
  const result = await list({ prefix: folder });
  return result.blobs;
}

export { list } from "@vercel/blob";