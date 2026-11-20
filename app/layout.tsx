import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SCRIPT_THEME } from "@/lib/theme";
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
  title: "Administration - Ville de Toamasina",
  description: "Interface d'administration de la commune",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // La classe `dark` est posée par le script avant React : écart d'hydratation attendu
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
