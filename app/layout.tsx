import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Using Outfit for that playful game look
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { LeaderboardProvider } from "@/components/LeaderboardProvider";
import { ControlsProvider } from "@/components/ControlsProvider";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GameHub | Play Free Games",
  description: "Your favorite free games in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} antialiased`}
      >
        <AuthProvider>
          <LeaderboardProvider>
            <ControlsProvider>
              {children}
            </ControlsProvider>
          </LeaderboardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
