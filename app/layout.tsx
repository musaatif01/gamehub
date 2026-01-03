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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-300`}
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
