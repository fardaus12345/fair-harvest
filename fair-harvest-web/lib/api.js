const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

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

export function getTrace(productId) {
  return request(`/trace/${productId}`);
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
