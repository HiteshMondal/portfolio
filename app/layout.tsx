import type { Metadata } from 'next';
import { Bricolage_Grotesque, Source_Serif_4 } from 'next/font/google';
import { getContent } from '@/lib/content';
import './globals.css';

const head = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-head' });
const body = Source_Serif_4({ subsets: ['latin'], variable: '--font-body' });

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return { title: `${c.name}, ${c.role}`, description: c.summary, openGraph: { title: c.name, description: c.summary, type: 'website' } };
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${head.variable} ${body.variable}`}><body>{children}</body></html>;
}
