interface BrandLogoProps {
  /** Pixel height of the logo mark. */
  size?: number;
  /** Show the 'ML Campus' wordmark next to the logo. */
  showWordmark?: boolean;
  /** Tailwind text-size class for the wordmark. */
  wordmarkClass?: string;
}

/**
 * Co-branded lockup: BYU-Idaho logo (on a white chip so a dark/transparent
 * logo stays visible on dark backgrounds) + "ML Campus".
 * The logo file lives at /public/byui-logo.svg.
 */
export default function BrandLogo({
  size = 32,
  showWordmark = true,
  wordmarkClass = 'text-xl font-bold',
}: BrandLogoProps) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="bg-white rounded-md p-1 flex items-center shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/byui-logo.svg" alt="BYU-Idaho" style={{ height: size, width: 'auto' }} />
      </span>
      {showWordmark && <span className={`${wordmarkClass} text-white`}>ML Campus</span>}
    </span>
  );
}
