import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AlertProvider } from "@/contexts/alert-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { AlertToaster } from "@/components/ui/alert-toaster";

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
  description: "Full-featured invoicing with client management, SST support, PDF generation, and payment tracking. Built for Malaysian SMEs and freelancers.",
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider>
          <AlertProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
                  {children}
                </main>
              </div>
            </div>
            <BottomNav />
            <AlertToaster />
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
