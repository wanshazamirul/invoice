const INGEST_URL = "https://monitor.cognitio.my/api/ingest";
const APP_ID = "invoice";

function parseDevice(ua: string): { device_type: string; browser: string; os: string } {
  const lower = ua.toLowerCase();
  let os = "unknown", browser = "unknown", device_type = "desktop";
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os")) os = "macOS";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("ios") || lower.includes("iphone") || lower.includes("ipad")) os = "iOS";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("chrome/") && !lower.includes("edg/")) browser = "Chrome";
  else if (lower.includes("safari/") && !lower.includes("chrome/")) browser = "Safari";
  else if (lower.includes("firefox/")) browser = "Firefox";
  if (lower.includes("mobile") || lower.includes("iphone")) device_type = "mobile";
  else if (lower.includes("ipad") || (lower.includes("android") && !lower.includes("mobile"))) device_type = "tablet";
  return { device_type, browser, os };
}

export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  const { device_type, browser, os } = parseDevice(navigator.userAgent);
  const body = JSON.stringify({ app_id: APP_ID, path, user_agent: navigator.userAgent, referrer: document.referrer || null, device_type, browser, os });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(INGEST_URL, new Blob([body], { type: "application/json" }));
  } else {
    fetch(INGEST_URL, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  }
}
