import type { Metadata, Viewport } from 'next';

const siteName = 'Zen Editor';
const siteUrl = 'https://zen-editor.vercel.app';
const description = '無料で使えるオンラインテキストエディタ。インストール不要でブラウザから即座に利用可能。日本語完全対応、全角スペース表示、ダークモード、検索・置換、Markdown プレビューやコマンドパレットなど開発者向け機能を網羅。プライバシーファースト設計でメモからコードまで安全に編集。';
const featureList = [
  'インストール不要・ログイン不要で即起動',
  '日本語完全対応と全角スペース表示',
  'シンタックスハイライトとコマンドパレット',
  'ダーク/ライトテーマとカスタムテーマ',
  '検索・置換や行移動などの効率化機能',
  'PWA 対応でオフラインでも編集可能',
  'ファイルはブラウザに保存するプライバシーファースト設計',
];
const faqEntities = [
  {
    question: 'Zen Editor は無料で使えますか？',
    answer: 'はい。アカウント登録や有料プランなしで、すべてのエディタ機能を無料で利用できます。',
  },
  {
    question: 'インストールやログインは必要ですか？',
    answer: '不要です。ブラウザがあればすぐに起動でき、PWA としてホーム画面に追加することも可能です。',
  },
  {
    question: 'ファイルの内容はどこに保存されますか？',
    answer: '編集内容はブラウザのローカルストレージに保存され、外部サーバーに送信されません。',
  },
  {
    question: 'プログラミング用途にも対応していますか？',
    answer: 'Monaco Editor ベースのためシンタックスハイライトや複数テーマに対応し、Markdown やコードの編集も快適です。',
  },
];

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
    'markdown editor',
    'syntax highlighting',
    'privacy-first editor',
    'PWA text editor',
    'browser text editor',
  ],
  authors: [{ name: 'Zen Editor Team' }],
  creator: 'Zen Editor Team',
  publisher: 'Zen Editor',
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
        alt: 'Zen Editor - 無料オンラインテキストエディタ',
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
  '@graph': [
    {
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
      featureList,
      screenshot: `${siteUrl}/screenshot.png`,
      softwareVersion: '1.0.0',
      author: {
        '@type': 'Organization',
        name: 'Zen Editor Team',
      },
      inLanguage: ['ja', 'en'],
    },
    {
      '@type': 'FAQPage',
      name: `${siteName} FAQ`,
      mainEntity: faqEntities.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Editor',
          item: `${siteUrl}/`,
        },
      ],
    },
  ],
  screenshot: `${siteUrl}/screenshot.png`,
  softwareVersion: '1.0.0',
  author: {
    '@type': 'Organization',
    name: 'Zen Editor Team',
  },
  inLanguage: ['ja', 'en'],
};
