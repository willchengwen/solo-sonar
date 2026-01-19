import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-8 border-t border-gray-100">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>© 2026 Solo Sonar</span>
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
