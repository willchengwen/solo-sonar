import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-20 sm:mt-24">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-3 h-3" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2" opacity="0.5" />
                <circle cx="16" cy="16" r="7" stroke="white" strokeWidth="2.5" opacity="0.9" />
                <circle cx="16" cy="16" r="3" fill="white" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">Solo Sonar</span>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm text-neutral-500">
            <Link href="#" className="hover:text-cyan-600 transition-colors">
              About
            </Link>
            <Link href="#" className="hover:text-cyan-600 transition-colors">
              Curators
            </Link>
            <Link href="#" className="hover:text-cyan-600 transition-colors">
              Privacy
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-neutral-400">© 2026 Solo Sonar</p>
        </div>
      </div>
    </footer>
  );
}
