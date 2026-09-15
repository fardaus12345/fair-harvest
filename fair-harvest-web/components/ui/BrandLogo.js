/**
 * The official Fair Harvest logo.
 *
 * Single source of truth for the brand mark so the header, the footer and
 * anything added later all render the same asset. The file is a normal static
 * asset in /public and is used exactly as supplied: intrinsic size 2000x667,
 * white artwork on a transparent background, which is why it sits on the dark
 * header and footer without any colour treatment.
 *
 * Only the rendered height is set in CSS; width stays auto so the 3:1 aspect
 * ratio is never stretched or cropped.
 */
export default function BrandLogo({ className = "" }) {
  return (
    <img
      src="/fair-harvest-logo.webp"
      alt="Fair Harvest"
      width={2000}
      height={667}
      className={`brandLogo ${className}`.trim()}
    />
  );
}
