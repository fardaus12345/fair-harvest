import { BadgeCheck, Link as LinkIcon } from "lucide-react";
import { getProduct } from "../../../lib/api.js";
import AddToCartButton from "../../../components/cart/AddToCartButton.js";
import WishlistButton from "../../../components/wishlist/WishlistButton.js";
import ReviewsSection from "../../../components/reviews/ReviewsSection.js";
import ProductImage from "../../../components/products/ProductImage.js";

export default async function ProductDetailPage({ params }) {
  const { productId } = await params;
  let product;
  try {
    const data = await getProduct(productId);
    product = data.product;
  } catch {
    product = null;
  }

  if (!product) {
    return (
      <main className="appPage">
        <div className="emptyState">This product could not be found.</div>
      </main>
    );
  }

  return (
    <main className="appPage">
      <header className="pageHeader">
        <div>
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
        </div>
        <span className={product.trust_score > 80 ? "badge good" : "badge warn"}>{product.trust_score}% trust</span>
      </header>

      <section className="traceGrid">
        <article className="toolPanel">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            category={product.category}
            style={{ height: 260 }}
          />
        </article>

        <article className="toolPanel">
          <h2>Details</h2>
          <p className="muted">{product.description || "No description provided by the farmer yet."}</p>
          <div className="splitLine">
            <strong>{product.price_bdt} BDT/kg</strong>
            <span className="badge">{product.quantity_kg} kg in stock</span>
          </div>
          <div className="scoreRow">
            <div><span>Freshness window</span><strong>{product.freshness_window_days} days</strong></div>
            <div className="bar"><span style={{ width: `${Math.min(100, product.freshness_window_days * 30)}%` }} /></div>
          </div>
          <div className="actionRow">
            <AddToCartButton productId={product.product_id} />
            <WishlistButton productId={product.product_id} />
            <a href={`/trace/${product.product_id}`}><LinkIcon size={16} /> View trace</a>
          </div>
        </article>

        <article className="toolPanel">
          <h2><BadgeCheck size={20} /> Farmer</h2>
          <p className="strong">{product.farmer_name || "Fair Harvest farmer"}</p>
          <p className="muted">{product.farmer_district || "Bangladesh"}</p>
          <span className={product.farmer_verification_status === "verified" ? "badge good" : "badge warn"}>
            {product.farmer_verification_status === "verified" ? "Verified farmer" : "Verification pending"}
          </span>
          {product.farmer_id && <a className="commandButton" href={`/farmers/${product.farmer_id}`}>View farmer profile</a>}
        </article>

        <article className="toolPanel">
          <h2>Status</h2>
          <p className="muted">Listing status: <strong>{product.status}</strong></p>
        </article>

        <ReviewsSection productId={product.product_id} />
      </section>
    </main>
  );
}
