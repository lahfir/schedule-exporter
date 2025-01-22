import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toast } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Schedule Extractor",
  description: "Extract schedule events from documents and convert them to calendar format",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <div id="toast-container" />
      </body>
    </html>
  );
}
