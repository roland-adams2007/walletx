import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Space_Grotesk,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import { AlertProvider } from "./lib/alert-context";
import AlertContainer from "./components/alert-container";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "WalletX",
  description: "Payment infrastructure for every business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AlertProvider>
          {children}
          <AlertContainer />
        </AlertProvider>
      </body>
    </html>
  );
}
