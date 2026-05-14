import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rhea Park — Product Designer",
  description: "Product designer based in London. MEng Design Engineering, Imperial College London.",
  icons: {
    icon: "/assets/goldfish.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}