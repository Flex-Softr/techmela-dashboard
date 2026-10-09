import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google"; // Added Hind_Siliguri
import AllProvider from "../providers/AllProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
});

const SITE_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME;

export const metadata: Metadata = {
  title: {
    default: SITE_NAME || "Electro commerce",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_NAME,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${hindSiliguri.variable}`}>
        <AllProvider>
          <main className="max-w-[1920px] mx-auto relative text-gray-900">
            {children}
            <Toaster />
          </main>
        </AllProvider>
      </body>
    </html>
  );
}
