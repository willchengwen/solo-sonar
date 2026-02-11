import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="v4-footer">
      <span>© 2026 Solo Sonar</span>
      <div className="footer-links">
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}
