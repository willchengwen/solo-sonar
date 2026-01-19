import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PLATFORM_INFO, Platform } from '@/types/types';

export async function generateStaticParams() {
  return Object.keys(PLATFORM_INFO).map((slug) => ({
    slug,
  }));
}

export default async function PlatformPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const platformId = slug as Platform;
  const platformInfo = PLATFORM_INFO[platformId];

  if (!platformInfo) {
    notFound();
  }

  const title = `Best of ${platformInfo.name}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-500 mb-6">Curated picks coming soon.</p>
      <Link href="/" className="text-blue-500 hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
