import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "MakeSG | Singapore creative-services and fabrication directory",
    template: "%s | MakeSG",
  },
  description:
    "Discover fabricators, craftspeople, creative studios and specialist services across Singapore.",
  openGraph: {
    title: "MakeSG",
    description:
      "Find the right people to help make your idea real across Singapore's creative production ecosystem.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
