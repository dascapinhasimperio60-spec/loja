"use client";

import { useEffect } from "react";
import { trackVisit } from "@/lib/track";

/** Drop-in page counter for the store (renders nothing). */
export function TrackVisit({ page, productId }: { page: "home" | "vitrine" | "produto"; productId?: string }) {
  useEffect(() => {
    trackVisit(page, productId);
  }, [page, productId]);
  return null;
}
