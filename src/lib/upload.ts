export type UploadKind =
  | "image"
  | "resume"
  | "certificate"
  | "gallery";

type Allowlist = {
  mimeTypes: string[];
  maxSizeBytes: number;
  extensions: string[];
};

const IMAGE_ALLOWLIST: Allowlist = {
  mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  maxSizeBytes: 5 * 1024 * 1024, // 5 MB
};

const PDF_ALLOWLIST: Allowlist = {
  mimeTypes: ["application/pdf"],
  extensions: [".pdf"],
  maxSizeBytes: 15 * 1024 * 1024, // 15 MB
};

export const uploadRules: Record<UploadKind, Allowlist> = {
  image: IMAGE_ALLOWLIST,
  gallery: IMAGE_ALLOWLIST,
  certificate: IMAGE_ALLOWLIST,
  resume: PDF_ALLOWLIST,
};

/** Public-facing rules (sizes/types) — safe to send to the client for UX. */
export const uploadLimits: Record<
  UploadKind,
  { maxSizeBytes: number; accept: string }
> = {
  image: {
    maxSizeBytes: IMAGE_ALLOWLIST.maxSizeBytes,
    accept: "image/jpeg,image/png,image/webp,image/gif",
  },
  gallery: {
    maxSizeBytes: IMAGE_ALLOWLIST.maxSizeBytes,
    accept: "image/jpeg,image/png,image/webp,image/gif",
  },
  certificate: {
    maxSizeBytes: IMAGE_ALLOWLIST.maxSizeBytes,
    accept: "image/jpeg,image/png,image/webp",
  },
  resume: {
    maxSizeBytes: PDF_ALLOWLIST.maxSizeBytes,
    accept: "application/pdf",
  },
};

export function validateUpload(kind: UploadKind, file: {
  name: string;
  size: number;
  type: string;
}): { ok: true } | { ok: false; error: string } {
  const rules = uploadRules[kind];

  if (file.size <= 0) {
    return { ok: false, error: "The file is empty." };
  }

  if (file.size > rules.maxSizeBytes) {
    const mb = rules.maxSizeBytes / (1024 * 1024);
    return { ok: false, error: `File is too large. Maximum size is ${mb} MB.` };
  }

  const name = file.name.toLowerCase();
  const extensionOk = rules.extensions.some((ext) => name.endsWith(ext));
  const mimeOk = rules.mimeTypes.includes(file.type.toLowerCase());

  if (!extensionOk || !mimeOk) {
    return { ok: false, error: "Unsupported file type." };
  }

  return { ok: true };
}

/**
 * Server-side magic-byte detection. The client-provided MIME type and filename
 * extension are easy to spoof, so we additionally inspect the actual file
 * signature. Returns a MIME string we recognise, or null for unknown content.
 */
export function sniffMime(bytes: Uint8Array): string | null {
  if (bytes.length < 4) return null;

  const h = (off: number, len: number) => {
    let s = "";
    for (let i = 0; i < len; i++) s += String.fromCharCode(bytes[off + i] ?? 0);
    return s;
  };

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  ) {
    return "image/png";
  }

  // GIF: "GIF8"
  if (h(0, 3) === "GIF" && bytes[3] === 0x38) {
    return "image/gif";
  }

  // WebP: "RIFF"...."WEBP"
  if (h(0, 4) === "RIFF" && h(8, 4) === "WEBP") {
    return "image/webp";
  }

  // PDF: "%PDF"
  if (h(0, 4) === "%PDF") {
    return "application/pdf";
  }

  return null;
}

/**
 * Validates the actual file bytes against the allowed content for a kind.
 * Returns the detected MIME on success, or an error message on failure.
 */
export function validateContent(
  kind: UploadKind,
  bytes: Uint8Array,
): { ok: true; mime: string } | { ok: false; error: string } {
  const detected = sniffMime(bytes);
  if (!detected) {
    return { ok: false, error: "The file contents do not match a supported format." };
  }

  if (!uploadRules[kind].mimeTypes.includes(detected)) {
    return { ok: false, error: "Unsupported file type." };
  }

  return { ok: true, mime: detected };
}