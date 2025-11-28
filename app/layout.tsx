import './globals.css';
import { Inter } from 'next/font/google';
import { metadata as seoMetadata, jsonLd } from './metadata';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = seoMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} h-full w-full max-w-full overflow-hidden`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
