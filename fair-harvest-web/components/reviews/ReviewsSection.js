"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getReviews, submitReview } from "../../lib/api.js";
import { useSession } from "../auth/useSession.js";

export default function ReviewsSection({ productId }) {
  const { user, loading: sessionLoading } = useSession();
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, [productId]);

  function load() {
    getReviews({ product_id: productId }).then(setData).catch(() => null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await submitReview({ product_id: productId, rating, comment: comment || undefined });
      setComment("");
      setStatus("done");
      load();
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err) {
      setStatus("error");
      setError(err.message || "Could not submit review");
    }
  }

  return (
    <article className="toolPanel wide">
      <h2><Star size={20} /> Reviews {data ? `(${data.review_count})` : ""}</h2>
      {data?.average_rating != null && <p className="strong">{data.average_rating} / 5 average</p>}

      <div className="resultStack">
        {(data?.reviews || []).map((review) => (
          <div className="splitLine" key={review.review_id}>
            <span>{review.customer_name} · {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
            <span className="muted">{review.comment}</span>
          </div>
        ))}
        {data && data.reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      </div>

      {!sessionLoading && user && user.role === "consumer" && (
        <form onSubmit={handleSubmit} className="traceEventForm">
          <label>
            Your rating
            <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value > 1 ? "s" : ""}</option>)}
            </select>
          </label>
          <label>
            Comment (optional)
            <input value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} placeholder="Share your experience" />
          </label>
          <button type="submit" disabled={status === "loading"}>{status === "loading" ? "Submitting..." : "Submit review"}</button>
          {error && <p className="formError">{error}</p>}
          <p className="muted">Only customers with a delivered order for this product can review it.</p>
        </form>
      )}
    </article>
  );
}
