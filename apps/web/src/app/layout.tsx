import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Social SaaS",
  description: "Local skeleton for AI social media automation SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

