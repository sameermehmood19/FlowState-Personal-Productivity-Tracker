import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "FlowState — Personal Productivity Tracker",
    template: "%s | FlowState",
  },
  description:
    "Track your daily productivity, study habits, focus, mood, and generate smart insights to optimize your performance.",
  keywords: ["productivity", "study tracker", "mood tracking", "focus", "analytics"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="system"
          />
        </Providers>
      </body>
    </html>
  );
}
