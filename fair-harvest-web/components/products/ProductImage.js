// Single place that decides how a product image is rendered, so every surface
// (marketplace, product page, cart, wishlist, orders, farmer and admin tools)
// falls back the same way. When a product has no image we keep the existing
// gradient tile the design already used, rather than introducing a new visual.

const CATEGORY_FALLBACK_LABEL = {
  fruit: "Fruit",
  grain: "Grain",
  herb: "Herb",
  vegetable: "Fresh"
};

export default function ProductImage({ src, alt, category, className = "", style, size }) {
  const classes = ["produceTile", size === "thumb" ? "produceTileThumb" : "", className]
    .filter(Boolean)
    .join(" ");

  if (!src) {
    return (
      <div className={classes} style={style} role="img" aria-label={alt ? `${alt} (no photo)` : "No product photo"}>
        {CATEGORY_FALLBACK_LABEL[category] || "Fresh"}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`${classes} productPhoto`}
      style={style}
      src={src}
      alt={alt || "Product photo"}
      loading="lazy"
    />
  );
}
