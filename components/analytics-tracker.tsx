"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const prev = useRef(pathname);

  useEffect(() => {
    if (pathname !== prev.current) {
      prev.current = pathname;
      trackPageView(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    trackPageView(pathname);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
