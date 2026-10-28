import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "ScamSmart – õpi pettusi ära tundma",
  description: "Lühikesed õppemoodulid ja test, mis aitavad noortel ja vanematel pettusi ära tunda.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="et">
      <body>
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 pb-8 text-xs text-slate-500">
          ScamSmart on õppeprojekt. Näited on välja mõeldud ega viita päris ettevõtetele.
        </footer>
      </body>
    </html>
  );
}
