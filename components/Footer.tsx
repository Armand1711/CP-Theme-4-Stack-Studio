import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer px">
      <div>© Stack Studio</div>
      <nav className="footer__links" aria-label="Legal">
        {/* TODO: point at real policy pages before launch. */}
        <Link href="#">Privacy</Link>
        <Link href="#">Terms</Link>
      </nav>
    </footer>
  );
}
