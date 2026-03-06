import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { ThemeProvider } from "@/components/ui/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "FraudGuard - AI Fraud Detection Engine",
  description:
    "Enterprise-grade AI-powered fraud detection. Instantly identify scams, phishing, and manipulative language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1 w-full">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                {children}
              </div>
            </main>

            {/* Enhanced Footer */}
            <footer className="relative border-t border-border/40 bg-gradient-to-b from-background via-background to-muted/20 backdrop-blur-sm">
              <div className="container max-w-6xl mx-auto px-4 py-12 sm:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  {/* Brand Column */}
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-lg gradient-text">
                      FraudGuard
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enterprise-grade fraud detection powered by AI.
                    </p>
                  </div>

                  {/* Product Column */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Product</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <a
                          href="/analyze"
                          className="hover:text-primary transition-colors"
                        >
                          Analyzer
                        </a>
                      </li>
                      <li>
                        <a
                          href="/demo"
                          className="hover:text-primary transition-colors"
                        >
                          Demo
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* Company Column */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Company</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <a
                          href="#"
                          className="hover:text-primary transition-colors"
                        >
                          About
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="hover:text-primary transition-colors"
                        >
                          Blog
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="hover:text-primary transition-colors"
                        >
                          Careers
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* Legal Column */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Legal</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <a
                          href="#"
                          className="hover:text-primary transition-colors"
                        >
                          Privacy
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="hover:text-primary transition-colors"
                        >
                          Terms
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="hover:text-primary transition-colors"
                        >
                          Security
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/40 pt-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      © 2026 FraudGuard. Hackathon Demo. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <a
                        href="#"
                        className="hover:text-primary transition-colors"
                      >
                        Twitter
                      </a>
                      <a
                        href="#"
                        className="hover:text-primary transition-colors"
                      >
                        GitHub
                      </a>
                      <a
                        href="#"
                        className="hover:text-primary transition-colors"
                      >
                        LinkedIn
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 opacity-60">
                    Powered by Google Gemini & Next.js • Enterprise Security
                    First
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
