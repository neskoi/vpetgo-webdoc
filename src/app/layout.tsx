import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VPET GO Docs",
  description: "Documentation website for the fan-made VPET GO project."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
