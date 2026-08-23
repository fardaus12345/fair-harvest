export class FairHarvestClient {
  constructor({ baseUrl = "http://localhost:4000", accessToken, fetchImpl = globalThis.fetch } = {}) {
    if (!fetchImpl) {
      throw new Error("A fetch implementation is required.");
    }

    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.accessToken = accessToken;
    this.fetch = fetchImpl;
  }

  withToken(accessToken) {
    return new FairHarvestClient({ baseUrl: this.baseUrl, accessToken, fetchImpl: this.fetch });
  }

  health() {
    return this.get("/health");
  }

  ready() {
    return this.get("/ready");
  }

  openApi() {
    return this.get("/openapi.json", { envelope: false });
  }

  register(payload) {
    return this.post("/api/v1/auth/register", payload);
  }

  login(payload) {
    return this.post("/api/v1/auth/login", payload);
  }

  oauth(payload) {
    return this.post("/api/v1/auth/oauth", payload);
  }

  me() {
    return this.get("/api/v1/auth/me");
  }

  cart(userId) {
    return this.get(`/api/v1/cart/${encodeURIComponent(userId)}`);
  }

  addCartItem(userId, payload) {
    return this.post(`/api/v1/cart/${encodeURIComponent(userId)}/items`, payload);
  }

  pushPrescriptionCart(userId, payload) {
    return this.post(`/api/v1/cart/${encodeURIComponent(userId)}/prescription`, payload);
  }

  clearCart(userId) {
    return this.request(`/api/v1/cart/${encodeURIComponent(userId)}`, { method: "DELETE" });
  }

  orders(userId) {
    return this.get(`/api/v1/orders/${encodeURIComponent(userId)}`);
  }

  checkout(userId, payload) {
    return this.post(`/api/v1/orders/${encodeURIComponent(userId)}/checkout`, payload);
  }

  recommendNutrition(payload) {
    return this.post("/api/v1/nutrition/recommend", payload);
  }

  verifyProduct(payload) {
    return this.post("/api/v1/products/verify", payload);
  }

  listProducts(params = {}) {
    return this.get(`/api/v1/products${toQuery(params)}`);
  }

  createProduct(payload) {
    return this.post("/api/v1/products", payload);
  }

  updateProduct(productId, payload) {
    return this.request(`/api/v1/products/${encodeURIComponent(productId)}`, { method: "PATCH", body: payload });
  }

  productScores(productId) {
    return this.get(`/api/v1/products/${encodeURIComponent(productId)}/scores`);
  }

  analyzeScanner(payload) {
    return this.post("/api/v1/scanner/analyze", payload);
  }

  trace(productId) {
    return this.get(`/api/v1/trace/${encodeURIComponent(productId)}`);
  }

  farmerScore(farmerId) {
    return this.get(`/api/v1/farmers/${encodeURIComponent(farmerId)}/score`);
  }

  voiceUpload(payload) {
    return this.post("/api/v1/voice/upload", payload);
  }

  nearbyFarms(params) {
    return this.get(`/api/v1/farms/nearby${toQuery(params)}`);
  }

  rewards(userId) {
    return this.get(`/api/v1/users/${encodeURIComponent(userId)}/rewards`);
  }

  predictHealth(payload) {
    return this.post("/api/v1/health/predict", payload);
  }

  dnaDiet(payload) {
    return this.post("/api/v1/dna/diet", payload);
  }

  soilNutrients(payload) {
    return this.post("/api/v1/soil/nutrients", payload);
  }

  donateWaste(payload) {
    return this.post("/api/v1/waste/donate", payload);
  }

  bookConsultation(payload) {
    return this.post("/api/v1/doctors/consultations/book", payload);
  }

  scheduleAutoDelivery(payload) {
    return this.post("/api/v1/meal-planner/auto-delivery", payload);
  }

  get(path, options = {}) {
    return this.request(path, { method: "GET", ...options });
  }

  post(path, body, options = {}) {
    return this.request(path, { method: "POST", body, ...options });
  }

  async request(path, { method, body, envelope = true } = {}) {
    const headers = {};
    if (body !== undefined) headers["content-type"] = "application/json";
    if (this.accessToken) headers.authorization = `Bearer ${this.accessToken}`;

    const response = await this.fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const payload = await response.json();

    if (!response.ok) {
      const message = payload?.message || `Fair Harvest API request failed with ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    if (envelope && typeof payload.success !== "boolean") {
      throw new Error("Fair Harvest API response envelope is missing.");
    }

    return payload;
  }
}

export function toQuery(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}
