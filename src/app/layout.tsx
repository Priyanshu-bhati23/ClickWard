import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClickWard — Product Experimentation Platform",
  description:
    "ClickWard helps teams run simple A/B experiments and understand which product experience performs better.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white text-slate-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
