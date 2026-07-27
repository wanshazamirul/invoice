import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/layout/nav-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AlertProvider } from "@/contexts/alert-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { AlertToaster } from "@/components/ui/alert-toaster";
import { AnalyticsTracker } from "@/components/analytics-tracker";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Invoice — Professional Invoicing for Malaysian Businesses",
  description: "Full-featured invoicing with client management, SST support, PDF generation, and payment tracking.",
  icons: { icon: '/icon.png', shortcut: '/icon.png', apple: '/icon.png' },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <AlertProvider>
            <NavBar />
            <main className="pt-14 pb-20 lg:pb-8">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <MobileNav />
            <AlertToaster />
            <AnalyticsTracker />
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
