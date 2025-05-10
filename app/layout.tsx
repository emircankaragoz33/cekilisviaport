import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { signOut, signIn, useSession } from "next-auth/react";
import { Providers } from "./providers";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Viaport Kartal Yuvası - Çekiliş Kontrol Sistemi",
  description: "KRTLYVS",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <nav className="bg-white dark:bg-gray-900 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <img src="https://www.google.com.tr/url?sa=i&url=https%3A%2F%2Fx.com%2Fviaporttkrtlyvs&psig=AOvVaw2TiJ0y-bwFkp_Vkc-W5Ynq&ust=1746953864803000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCLDohrbEmI0DFQAAAAAdAAAAABAE" alt="Beşiktaş Logo" className="h-8 w-8 mr-3" />
                    <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      Çekiliş Sistemi
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4">
                    <HeaderAuth />
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
              <p>
                Powered by{" "}
                <a
                  href=""
                  target="_blank"
                  className="font-bold hover:underline"
                  rel="noreferrer"
                >
                  Emircan Karagöz
                </a>
              </p>
              <ThemeSwitcher />
            </footer>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
