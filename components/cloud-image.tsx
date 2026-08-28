"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageOff } from "lucide-react";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  loading?: "eager" | "lazy";
};

function directUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function CloudImage({
  src,
  alt,
  className = "h-full w-full object-cover",
  fallbackClassName = "grid h-full min-h-32 place-items-center bg-white/[0.025] text-slate-600",
  loading = "lazy"
}: Props) {
  const source = src?.trim() ?? "";
  const [mode, setMode] = useState<"proxy" | "direct" | "failed">("proxy");

  useEffect(() => setMode("proxy"), [source]);

  const proxy = useMemo(
    () => source ? `/api/image?url=${encodeURIComponent(source)}` : "",
    [source]
  );

  if (!source || mode === "failed") {
    return (
      <div className={fallbackClassName} role="img" aria-label={source ? `تعذر تحميل ${alt}` : alt}>
        <div className="grid place-items-center gap-2 text-center">
          <ImageOff size={24} />
          {source && <span className="text-[11px]">تعذر تحميل الصورة</span>}
        </div>
      </div>
    );
  }

  return (
    <img
      src={mode === "proxy" ? proxy : directUrl(source)}
      alt={alt}
      loading={loading}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setMode((current) => current === "proxy" ? "direct" : "failed")}
    />
  );
}
