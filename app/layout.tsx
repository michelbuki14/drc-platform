import type { Metadata } from "next";
import "./globals.css";
import I18nWrapper from "@/components/I18nWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "CongoConnect — Travel • Cargo • Connect",
  description:
    "The trusted digital ecosystem connecting the Democratic Republic of the Congo with the world — book flights, arrange cargo, track shipments, reserve hotels, rent vehicles, buy travel insurance, and access passenger facilitation.",
  keywords: [
    "CongoConnect",
    "DRC travel",
    "book flights DRC",
    "Kinshasa flights",
    "Lubumbashi flights",
    "Goma flights",
    "cargo DRC",
    "shipment tracking DRC",
    "M-Pesa flights",
    "Airtel Money flights",
    "Orange Money flights",
    "passenger assistance DRC",
    "hotel reservations DRC",
    "travel insurance DRC",
  ],
  authors: [{ name: "CongoConnect" }],
  applicationName: "CongoConnect",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CongoConnect",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "CongoConnect — Travel • Cargo • Connect",
    description: "The trusted digital ecosystem connecting the DRC with the world.",
    type: "website",
    siteName: "CongoConnect",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0B2545" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1118" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cc-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('light');}})();`,
          }}
        />
      </head>
      <body className="font-sans bg-cc-cream text-cc-charcoal antialiased">
        <ThemeProvider>
          <AuthProvider>
            <I18nWrapper>
              <Header />
              <div className="pb-16 sm:pb-0">{children}</div>
            </I18nWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
