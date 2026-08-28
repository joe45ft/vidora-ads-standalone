"use client";

import { useEffect } from "react";

function markView(id: string) {
  const key = `vidora-ad-view:${id}`;

  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Tracking can continue when storage is unavailable.
  }

  void fetch(`/api/ads/${id}/view`, {
    method: "POST",
    keepalive: true
  }).catch(() => undefined);
}

export function CourseViewTracker({ adId }: { adId: string }) {
  useEffect(() => {
    markView(adId);
  }, [adId]);

  return null;
}
