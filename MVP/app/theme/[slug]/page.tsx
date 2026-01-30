import Link from 'next/link';
import { notFound } from 'next/navigation';
import { THEME_INFO, Theme } from '@/types/types';

export async function generateStaticParams() {
  return Object.keys(THEME_INFO).map((slug) => ({
    slug,
  }));
}

export default async function ThemePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const themeId = slug as Theme;
  const themeInfo = THEME_INFO[themeId];

  if (!themeInfo) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-2">{themeInfo.name}</h1>
      <p className="text-gray-500 mb-6">Books and stacks with this theme coming soon.</p>
      <Link href="/" className="text-blue-500 hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
