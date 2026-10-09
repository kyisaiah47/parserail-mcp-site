import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import SmoothScroll from '@/components/SmoothScroll';
import { PRODUCT } from '@/lib/product';
import './globals.css';
import '@/components/site-view/simple.css';
import SiteViewProvider from '@/components/site-view/SiteViewProvider';
import Welcome from '@/components/site-view/Welcome';
import Mark from '@/components/site-view/Mark';
import Analytics from '@/components/Analytics';

const mono = IBM_Plex_Mono({ variable: '--font-mono', subsets: ['latin'], weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: `${PRODUCT.name} MCP | metered tool calls`,
  description: 'The parserail-mcp tool surface, with each call and its current credit cost.',
  metadataBase: new URL(`https://${PRODUCT.host}`),
  alternates: { canonical: '/' },
  openGraph: { title: `${PRODUCT.name} MCP | metered tool calls`, description: 'ParseRail provides document tools for any MCP client. You pay per call, and each tool lists its current credit cost.', url: `https://${PRODUCT.host}`, siteName: PRODUCT.name, type: 'website', images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'ParseRail MCP: metered tool calls' }] },
  twitter: { card: 'summary_large_image', title: `${PRODUCT.name} MCP | metered tool calls`, description: 'ParseRail gives an MCP client native document and data tools.', images: ['/og.jpg'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: PRODUCT.name, applicationCategory: 'DeveloperApplication', publisher: { '@type': 'Organization', '@id': 'https://thecompound.tech/#organization', name: 'Compound Labs', url: 'https://thecompound.tech' } };
  return <html lang="en" className={mono.variable}><body><Analytics /><SmoothScroll /><SiteViewProvider slug="parserail-mcp" welcome={<Welcome copy={{
    name: `${PRODUCT.name} MCP`,
    mark: <Mark />,
    eyebrow: 'YOUR AI CLIENT. YOUR DOCUMENTS.',
    question: 'Can your AI client read an invoice and hand back clean data?',
    explain: 'This MCP server gives Claude, Cursor and other MCP clients ParseRail tools. Your client calls a tool, and you pay credits only when the call succeeds.',
    illustration: { head: 'ONE DOCUMENT. ONE TOOL CALL.', before: 'You ask your client to read a supplier invoice.', answer: 'It calls Document parse and gets the fields back as JSON.', tag: 'CHARGED ONLY ON SUCCESS', after: 'The price of each tool is listed before you call it.' },
  }} />}>{children}</SiteViewProvider><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /></body></html>;
}
