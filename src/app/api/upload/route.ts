import { NextResponse } from "next/server";

import { getAdmin } from "@/lib/admin";
import { UploadError, uploadFile } from "@/lib/blob";
import {
  uploadRules,
  validateContent,
  validateUpload,
  type UploadKind,
} from "@/lib/upload";

export const runtime = "nodejs";

const FOLDER_BY_KIND: Record<UploadKind, string> = {
  image: "media/profile",
  gallery: "media/projects",
  certificate: "media/certificates",
  resume: "media/resume",
};

export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let kind: UploadKind;
  let file: File | null = null;

  try {
    const formData = await request.formData();
    const kindRaw = formData.get("kind");
    kind = (kindRaw as UploadKind) ?? "image";
    file = formData.get("file") as File | null;
  } catch {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 },
    );
  }

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!(kind in uploadRules)) {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }

  const validation = validateUpload(kind, {
    name: file.name,
    size: file.size,
    type: file.type,
  });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    return NextResponse.json(
      { error: "Could not read the uploaded file." },
      { status: 400 },
    );
  }

  // Validate the actual file signature, not just the client-provided MIME/extension.
  const content = validateContent(kind, bytes);
  if (!content.ok) {
    return NextResponse.json({ error: content.error }, { status: 400 });
  }

  const folder = FOLDER_BY_KIND[kind];
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filename = `${Date.now()}-${safeName}`;

  try {
    const blob = await uploadFile(filename, Buffer.from(bytes), {
      folder,
      contentType: content.mime,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      {
        error:
          "Upload failed. Please check the image format and storage configuration.",
      },
      { status: 500 },
    );
  }
}
