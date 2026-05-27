import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIpulse",
  description: "AI 뉴스 & 논문 데일리 다이제스트",
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('aipulse-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
