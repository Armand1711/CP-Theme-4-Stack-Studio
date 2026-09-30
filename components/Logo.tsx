/* eslint-disable @next/next/no-img-element */
/*
 * Stack Studio brand assets. Source SVGs live in public/brand/:
 *   stack-studio-mark.svg      the "A" mark on its own
 *   stack-studio-wordmark.svg  STACK letters only (the logo cropped for small sizes like the nav)
 *   stack-studio-logo.svg      full lockup with "Software Development Studio"
 */

/** The "A" mark, inline so it can take any colour (defaults to currentColor). */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 181 173"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M70.5488 172.773H110.863L90.9609 136.779L70.5488 172.773Z" />
      <path d="M90.5003 0V68.3894L38.5655 172.773H0L90.5003 0Z" />
      <path d="M90.4997 0V68.3894L142.435 172.773H181L90.4997 0Z" />
    </svg>
  );
}

/** STACK wordmark, for places where the full lockup's small line would be unreadable. */
export function LogoWordmark({ height = 22 }: { height?: number }) {
  return (
    <img
      src="/brand/stack-studio-wordmark.svg"
      alt="Stack Studio"
      height={height}
      width={Math.round((678 / 134) * height)}
      style={{ display: "block", height, width: "auto" }}
    />
  );
}

/** Full logo with "Software Development Studio". */
export function LogoFull({ width = 220 }: { width?: number }) {
  return (
    <img
      src="/brand/stack-studio-logo.svg"
      alt="Stack Studio, Software Development Studio"
      width={width}
      height={Math.round((244 / 811) * width)}
      style={{ display: "block", width, height: "auto" }}
    />
  );
}
