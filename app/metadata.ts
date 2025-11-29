import type { Metadata, Viewport } from 'next';

const siteName = 'Mochi Editor';
const siteUrl = 'https://mochi-editor.vercel.app';
const description = '無料で使えるオンラインテキストエディタ。インストール不要でブラウザから即座に利用可能。日本語完全対応、全角スペース表示、ダークモード、検索・置換機能搭載。プログラミングからメモまで幅広く対応。';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - 無料オンラインテキストエディタ | Free Online Text Editor`,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    'テキストエディタ',
    'オンラインエディタ',
    'コードエディタ',
    'プログラミング',
    'メモ帳',
    '無料',
    'ブラウザ',
    '日本語対応',
    'ダークモード',
    '全角スペース',
    'text editor',
    'online editor',
    'code editor',
    'programming',
    'notepad',
    'free',
    'browser',
    'Japanese',
    'dark mode',
    'Monaco Editor',
  ],
  authors: [{ name: 'Mochi Editor Team' }],
  creator: 'Mochi Editor Team',
  publisher: 'Mochi Editor',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'ja-JP': siteUrl,
      'en-US': siteUrl,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: 'en_US',
    url: siteUrl,
    siteName,
    title: `${siteName} - 無料オンラインテキストエディタ`,
    description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mochi Editor - 無料オンラインテキストエディタ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - 無料オンラインテキストエディタ`,
    description,
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
  category: 'technology',
  classification: 'Text Editor, Development Tools',
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteName,
  description,
  url: siteUrl,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  featureList: [
    '日本語完全対応',
    '全角スペース表示',
    'ダークモード',
    '検索・置換',
    'シンタックスハイライト',
    '自動保存',
    'キーボードショートカット',
  ],
  screenshot: `${siteUrl}/screenshot.png`,
  softwareVersion: '1.0.0',
  author: {
    '@type': 'Organization',
    name: 'Mochi Editor Team',
  },
  inLanguage: ['ja', 'en'],
};
