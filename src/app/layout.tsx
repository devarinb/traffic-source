import type { Metadata, Viewport } from "next";
import { Epilogue, JetBrains_Mono } from "next/font/google";

import "react-flagpack/dist/style.css";

import { Providers } from "@/app/providers";
import "@/app/globals.css";

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem('theme');
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export const metadata: Metadata = {
  title: {
    default: "Traffic Source",
    template: "%s - Traffic Source",
  },
  icons: {
    icon: "https://c1.tablecdn.com/trafficsource/ta.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${epilogue.variable} ${jetbrainsMono.variable} min-h-screen bg-[var(--bg)] text-[var(--text)]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
