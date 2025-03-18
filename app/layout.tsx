import "@/src/client/app/style/globals.css";
import { ThemeProvider } from "@/src/client/app/style/theme-provider";
import { QueryProvider } from "@/src/client/shared/lib/react-query/QueryProvider";
import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR } from "next/font/google";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog To Video",
  description: "Blog To Video",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSansKR.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
