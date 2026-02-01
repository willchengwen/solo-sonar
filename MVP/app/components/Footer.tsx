import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-deep-200 py-6 px-5 bg-white/50">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-neutral-400">© 2026 Solo Sonar</p>
        <div className="flex items-center gap-6 text-sm text-neutral-500">
          <Link href="/about" className="hover:text-deep-900 transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-deep-900 transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
