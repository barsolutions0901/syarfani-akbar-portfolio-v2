"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/cn";
import { uploadLimits, type UploadKind } from "@/lib/upload";

type ImageUploadProps = {
  kind: UploadKind;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
};

export function ImageUpload({
  kind,
  value,
  onChange,
  label = "Upload",
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limits = uploadLimits[kind];
  const isResume = kind === "resume";
  const sizeMb = (limits.maxSizeBytes / (1024 * 1024)).toFixed(0);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("kind", kind);
      form.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload.error ?? "Upload failed");
      }

      onChange(payload.url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {uploading ? "Uploading…" : isResume ? "Upload PDF" : label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={limits.accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <p className="text-xs text-muted">
        {isResume
          ? `PDF up to ${sizeMb} MB.`
          : `JPG, PNG, WebP or GIF up to ${sizeMb} MB.`}
      </p>

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      {value && (
        <div className="mt-1">
          {isResume ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary underline underline-offset-2"
            >
              Current file (open)
            </a>
          ) : (
            <div className="relative h-32 w-48 overflow-hidden rounded-xl border border-line bg-surface">
              <Image
                src={value}
                alt="Preview"
                fill
                sizes="192px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}