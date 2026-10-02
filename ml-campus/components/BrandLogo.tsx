interface BrandLogoProps {
  /** Pixel height of the logo mark. */
  size?: number;
  /** Show the 'ML Campus' wordmark next to the logo. */
  showWordmark?: boolean;
  /** Tailwind text-size class for the wordmark. */
  wordmarkClass?: string;
}

/**
 * Co-branded lockup: BYU-Idaho logo + "ML Campus".
 * The logo file lives at /public/byui-logo.png — replace that single file with
 * the official BYU-Idaho asset (same path/name) and it updates everywhere.
 */
export default function BrandLogo({
  size = 32,
  showWordmark = true,
  wordmarkClass = 'text-xl font-bold',
}: BrandLogoProps) {
  return (
    <span className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/byui-logo.png" alt="BYU-Idaho" width={size} height={size} />
      {showWordmark && <span className={`${wordmarkClass} text-white`}>ML Campus</span>}
    </span>
  );
}
