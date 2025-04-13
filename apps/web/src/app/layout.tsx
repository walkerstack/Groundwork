import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { constructMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

import Providers from "./providers";

export const metadata = constructMetadata();

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-background min-h-screen font-sans antialiased",
        inter.variable,
      )}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
