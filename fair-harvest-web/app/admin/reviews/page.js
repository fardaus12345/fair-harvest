"use client";

import { useEffect, useState } from "react";
import { getAdminReviews, moderateReview } from "../../../lib/api.js";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getAdminReviews()
      .then((data) => setReviews(data.reviews || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggle(reviewId, currentStatus) {
    await moderateReview(reviewId, currentStatus === "published" ? "hidden" : "published");
    load();
  }

  if (loading) return <div className="skeletonCard tall" />;

  if (reviews.length === 0) {
    return <div className="emptyState">No reviews submitted yet.</div>;
  }

  return (
    <section className="toolPanel">
      <div className="dataTable">
        {reviews.map((review) => (
          <div key={review.review_id}>
            <span>{review.product_name}</span>
            <span>{review.customer_name}</span>
            <span>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
            <span className="muted">{review.comment}</span>
            <span className={review.status === "published" ? "badge good" : "badge warn"}>{review.status}</span>
            <button className="ghostButton" onClick={() => toggle(review.review_id, review.status)}>
              {review.status === "published" ? "Hide" : "Republish"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
