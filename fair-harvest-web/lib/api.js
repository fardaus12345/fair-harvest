// Same-origin by default — this app serves its own API routes under
// /api/v1, so there is no separate backend host to fall back to.
const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("fairHarvestToken");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_ROOT}${path}`, { ...options, headers, cache: "no-store" });
  const body = await response.json().catch(() => ({ success: false, message: "Invalid API response" }));
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") window.location.href = "/auth";
    throw new Error(body.message || "Request failed");
  }
  return body.data;
}

export function getNutritionRecommendation(data) {
  return request("/nutrition/recommend", { method: "POST", body: JSON.stringify(data) });
}

export function logMeal(data) {
  return request("/nutrition/log", { method: "POST", body: JSON.stringify(data) });
}

export function getProducts(filters = {}) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined));
  return request(`/products?${query.toString()}`);
}

export function createProduct(data) {
  return request("/products", { method: "POST", body: JSON.stringify(data) });
}

export function getProduct(productId) {
  return request(`/products/${productId}`);
}

export function updateProduct(productId, data) {
  return request(`/products/${productId}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function getAdminMetrics() {
  return request("/admin/metrics");
}

export function getAdminFarmers() {
  return request("/admin/farmers");
}

export function updateAdminFarmer(farmerId, data) {
  return request(`/admin/farmers/${farmerId}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function getAdminVerificationQueue() {
  return request("/admin/farmers/verifications");
}

export function approveFarmerVerification(farmerId) {
  return request(`/admin/farmers/${farmerId}/verification/approve`, { method: "POST" });
}

export function rejectFarmerVerification(farmerId) {
  return request(`/admin/farmers/${farmerId}/verification/reject`, { method: "POST" });
}

export function getAdminProducts() {
  return request("/admin/products");
}

export function getAdminCustomers() {
  return request("/admin/customers");
}

export function updateAdminCustomer(userId, data) {
  return request(`/admin/customers/${userId}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function getAdminOrders() {
  return request("/admin/orders");
}

export function getTrace(productId) {
  return request(`/trace/${productId}`);
}

export function addTraceEvent(productId, data) {
  return request(`/trace/${productId}`, { method: "POST", body: JSON.stringify(data) });
}

export function getReviews(query) {
  const params = new URLSearchParams(query).toString();
  return request(`/reviews${params ? `?${params}` : ""}`);
}

export function submitReview(data) {
  return request("/reviews", { method: "POST", body: JSON.stringify(data) });
}

export function getWishlist() {
  return request("/wishlist");
}

export function addToWishlist(productId) {
  return request("/wishlist", { method: "POST", body: JSON.stringify({ product_id: productId }) });
}

export function getWishlistStatus(productId) {
  return request(`/wishlist/${productId}`);
}

export function removeFromWishlist(productId) {
  return request(`/wishlist/${productId}`, { method: "DELETE" });
}

export function getFarmerProfile(farmerId) {
  return request(`/farmers/${farmerId}/profile`);
}

export function getFarmerOrders() {
  return request("/farmer/orders");
}

export function getFarmerEarnings() {
  return request("/farmer/earnings");
}

export function getAdminReviews() {
  return request("/admin/reviews");
}

export function moderateReview(reviewId, status) {
  return request(`/admin/reviews/${reviewId}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function getFarmerScore(farmerId) {
  return request(`/farmers/${farmerId}/score`);
}

export function getNearbyFarmers(filters) {
  const query = new URLSearchParams(filters);
  return request(`/farmers/nearby?${query.toString()}`);
}

export function uploadVoice(audioBase64, farmerId = "f001") {
  return request("/voice/upload", {
    method: "POST",
    body: JSON.stringify({ farmer_id: farmerId, audio_base64: audioBase64 })
  });
}

export function analyzeFood(imageBase64, productName = "produce") {
  return request("/scanner/analyze", {
    method: "POST",
    body: JSON.stringify({ image_base64: imageBase64, produce_type: productName, product_name: productName })
  });
}

export function login(data) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(data) });
}

export function register(data) {
  return request("/auth/register", { method: "POST", body: JSON.stringify(data) });
}

export function getRewards(userId = "u001") {
  return request(`/users/${userId}/rewards`);
}

export function getMe() {
  return request("/auth/me");
}

export function getCart(userId) {
  return request(`/cart/${userId}`);
}

export function addCartItem(userId, data) {
  return request(`/cart/${userId}/items`, { method: "POST", body: JSON.stringify(data) });
}

export function updateCartItem(userId, itemId, data) {
  return request(`/cart/${userId}/items/${itemId}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function removeCartItem(userId, itemId) {
  return request(`/cart/${userId}/items/${itemId}`, { method: "DELETE" });
}

export function clearCart(userId) {
  return request(`/cart/${userId}`, { method: "DELETE" });
}

export function checkout(userId, data) {
  return request(`/orders/${userId}/checkout`, { method: "POST", body: JSON.stringify(data) });
}

export function getOrders(userId) {
  return request(`/orders/${userId}`);
}

export function getOrderDetail(orderId) {
  return request(`/orders/detail/${orderId}`);
}

export function updateOrderStatus(orderId, data) {
  return request(`/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify(data) });
}

export function verifyFarmerCard(farmerId, data) {
  return request(`/farmers/${farmerId}/verify`, { method: "POST", body: JSON.stringify(data) });
}

export function getFarmerVerificationStatus(farmerId) {
  return request(`/farmers/${farmerId}/verification-status`);
}
