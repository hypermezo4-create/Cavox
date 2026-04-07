"use client";

import { useRef, useState } from "react";
import { uploadImageFile } from "@/lib/admin-api";

export default function UploadButton({ token, onUploaded, label = "Upload image" }: { token?: string; onUploaded: (url: string) => void; label?: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setBusy(true);
    setError(null);
    try {
      const url = await uploadImageFile(file, token);
      onUploaded(url);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={!token || busy}
        className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Uploading..." : label}
      </button>
      {error ? <p className="text-xs text-red-200">{error}</p> : null}
    </div>
  );
}
