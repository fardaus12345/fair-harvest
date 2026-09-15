import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: { title: "Fair Harvest API", version: "1.0.0" },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/auth/register": { post: { summary: "Register a consumer or farmer account", tags: ["auth"] } },
    "/auth/login": { post: { summary: "Log in and receive an access token", tags: ["auth"] } },
    "/auth/me": { get: { summary: "Get the authenticated user's profile", tags: ["auth"] } },
    "/farmers/{farmerId}/verify": { post: { summary: "Submit Government Farmer Card details for verification", tags: ["farmers"] } },
    "/farmers/{farmerId}/verification-status": { get: { summary: "Get a farmer's verification status", tags: ["farmers"] } },
    "/farmers/{farmerId}/score": { get: { summary: "Get a farmer's reputation score", tags: ["farmers"] } },
    "/products": {
      get: { summary: "List marketplace products", tags: ["products"] },
      post: { summary: "Create a product (verified farmers only)", tags: ["products"] }
    },
    "/products/{productId}": {
      get: { summary: "Get product details", tags: ["products"] },
      patch: { summary: "Update a product (owner or admin)", tags: ["products"] },
      delete: { summary: "Archive a product (owner or admin)", tags: ["products"] }
    },
    "/products/{productId}/scores": { get: { summary: "Get eco/health/pesticide scores for a product", tags: ["products"] } },
    "/uploads/product-image": {
      post: { summary: "Upload a product image (verified farmer or admin); returns image_url", tags: ["uploads"] },
      get: { summary: "Get the accepted image types and size limit", tags: ["uploads"] }
    },
    "/uploads/{key}": { get: { summary: "Serve a stored image (local storage provider only)", tags: ["uploads"] } },
    "/cart/{userId}": {
      get: { summary: "Get a user's cart", tags: ["cart"] },
      delete: { summary: "Clear a user's cart", tags: ["cart"] }
    },
    "/cart/{userId}/items": { post: { summary: "Add an item to the cart", tags: ["cart"] } },
    "/cart/{userId}/items/{itemId}": {
      patch: { summary: "Update a cart item's quantity", tags: ["cart"] },
      delete: { summary: "Remove a cart item", tags: ["cart"] }
    },
    "/orders/{userId}": { get: { summary: "List a user's orders", tags: ["orders"] } },
    "/orders/{userId}/checkout": { post: { summary: "Checkout the user's cart into an order (demo payment)", tags: ["orders"] } },
    "/orders/detail/{orderId}": { get: { summary: "Get full order detail with status timeline", tags: ["orders"] } },
    "/orders/{orderId}/status": { post: { summary: "Update an order's status (farmer or admin)", tags: ["orders"] } },
    "/trace/{productId}": { get: { summary: "Get a product's soil-to-plate trace", tags: ["trace"] } },
    "/users/{userId}/rewards": { get: { summary: "Get a user's rewards balance and badges", tags: ["rewards"] } },
    "/admin/metrics": { get: { summary: "Platform overview metrics", tags: ["admin"] } },
    "/admin/farmers": { get: { summary: "List all farmers", tags: ["admin"] } },
    "/admin/farmers/{farmerId}": { patch: { summary: "Suspend or reinstate a farmer's account", tags: ["admin"] } },
    "/admin/farmers/verifications": { get: { summary: "List pending Farmer Card verifications", tags: ["admin"] } },
    "/admin/farmers/{farmerId}/verification/approve": { post: { summary: "Manually approve a farmer's verification", tags: ["admin"] } },
    "/admin/farmers/{farmerId}/verification/reject": { post: { summary: "Reject a farmer's verification", tags: ["admin"] } },
    "/admin/products": { get: { summary: "List all products with search, category and status filters", tags: ["admin"] } },
    "/admin/customers": { get: { summary: "List all customers", tags: ["admin"] } },
    "/admin/customers/{userId}": { patch: { summary: "Suspend or reinstate a customer's account", tags: ["admin"] } },
    "/admin/orders": { get: { summary: "List all orders", tags: ["admin"] } },
    "/nutrition/recommend": { post: { summary: "Get a personalized nutrition plan", tags: ["nutrition"] } },
    "/nutrition/log": { post: { summary: "Log a meal (awards reward points)", tags: ["nutrition"] } },
    "/scanner/analyze": { post: { summary: "Analyze produce freshness/chemical risk", tags: ["scanner"] } }
  }
};

export async function GET() {
  return NextResponse.json(spec);
}
