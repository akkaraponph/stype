import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TanstackProvider } from "@/providers/TanstackProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "slowlytype",
  description: "Minimal typing test focused on calm, consistent typing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem("slowlytype-theme");if(t==="dark"||t==="light")document.documentElement.classList.add(t);else if(window.matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.classList.add("dark");else document.documentElement.classList.add("light");})();`,
        }}
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TanstackProvider>{children}</TanstackProvider>
      </body>
    </html>
  );
}
