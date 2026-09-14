import { BadgeCheck, MapPin, Star } from "lucide-react";
import { getFarmerProfile } from "../../../lib/api.js";

export default async function FarmerProfilePage({ params }) {
  const { farmerId } = await params;
  let data = null;
  let loadError = null;
  try {
    data = await getFarmerProfile(farmerId);
  } catch (err) {
    loadError = err.message || "Could not load this farmer profile";
  }

  if (!data) {
    return (
      <main className="appPage">
        <div className="emptyState">{loadError || "Farmer profile not found."}</div>
      </main>
    );
  }

  const { farmer, products, reviews } = data;

  return (
    <main className="appPage">
      <header className="pageHeader">
        <div>
          <p className="eyebrow">{farmer.district || "Bangladesh"}</p>
          <h1>{farmer.name}</h1>
        </div>
        <span className={farmer.verification_status === "verified" ? "badge good" : "badge warn"}>
          {farmer.verification_status === "verified" ? "Verified farmer" : "Verification pending"}
        </span>
      </header>

      <section className="metricGrid compact">
        <article className="metric"><BadgeCheck /><span>Reputation</span><strong>{farmer.reputation_score}</strong></article>
        <article className="metric"><span>Badge</span><strong>{farmer.badge}</strong></article>
        <article className="metric"><Star /><span>Rating</span><strong>{farmer.average_rating != null ? `${farmer.average_rating} / 5` : "No reviews yet"}</strong></article>
        <article className="metric"><MapPin /><span>Farmer Card</span><strong>{farmer.farmer_card_number_masked || "Not submitted"}</strong></article>
      </section>

      <section className="traceGrid">
        <article className="toolPanel wide">
          <h2>Products from {farmer.name}</h2>
          <div className="cardGrid">
            {products.map((product) => (
              <article className="productCard" key={product.product_id}>
                <div className="splitLine"><h2><a href={`/marketplace/${product.product_id}`}>{product.name}</a></h2><span className="badge">{product.trust_score}%</span></div>
                <p className="muted">{product.category}</p>
                <div className="splitLine"><strong>{product.price_bdt} BDT/kg</strong><span className="badge">{product.quantity_kg} kg</span></div>
              </article>
            ))}
            {products.length === 0 && <p className="muted">No active listings right now.</p>}
          </div>
        </article>

        <article className="toolPanel wide">
          <h2>Reviews ({reviews.length})</h2>
          <div className="resultStack">
            {reviews.map((review) => (
              <div className="splitLine" key={review.review_id}>
                <span>{review.customer_name} · {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                <span className="muted">{review.comment}</span>
              </div>
            ))}
            {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
          </div>
        </article>
      </section>
    </main>
  );
}
