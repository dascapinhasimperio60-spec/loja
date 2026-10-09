import type { Metadata, Viewport } from "next";
import { Archivo, Doto } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});

const doto = Doto({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-doto",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Império das Capinhas | Capinhas e acessórios para celular",
    template: "%s | Império das Capinhas",
  },
  description:
    "Capinhas, películas e acessórios para iPhone, Samsung, Motorola e Xiaomi. Fotos reais do nosso estoque, compra segura pelo Mercado Livre e envio para todo o Brasil.",
  applicationName: "Império das Capinhas",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Império das Capinhas",
    images: [{ url: "/brand/loja-letreiro.webp", width: 1280, height: 720, alt: "Fachada da loja Império das Capinhas" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${doto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
