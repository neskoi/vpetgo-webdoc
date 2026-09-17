import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display"
});

const themeScript = `
(() => {
  try {
    const theme = window.localStorage.getItem("vpetgo.theme");

    if (theme === "dark") {
      document.documentElement.dataset.theme = "dark";
    }
  } catch {}
})();
`;

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={pressStart2P.variable}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
