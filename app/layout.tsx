import './globals.css';
import { Inter } from 'next/font/google';
import { metadata as seoMetadata, viewport as seoViewport, jsonLd } from './metadata';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = seoMetadata;
export const viewport = seoViewport;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full" suppressHydrationWarning>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: blob:; font-src 'self' data: https://cdn.jsdelivr.net; connect-src 'self' https://cdn.jsdelivr.net; worker-src 'self' blob:; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} h-full w-full max-w-full overflow-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
