import assert from "node:assert/strict";
import test from "node:test";

import { FairHarvestClient, toQuery } from "../src/index.js";

test("toQuery builds encoded query strings", () => {
  assert.equal(toQuery({ lat: 23.8, category: "leafy greens", empty: undefined }), "?lat=23.8&category=leafy+greens");
});

test("client sends JSON and validates envelopes", async () => {
  const calls = [];
  const client = new FairHarvestClient({
    baseUrl: "http://example.test/",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return Response.json({ success: true, data: { ok: true }, message: "OK" });
    }
  });

  const response = await client.recommendNutrition({ age: 35, weight: 72, conditions: [], goal: "maintenance" });

  assert.equal(response.success, true);
  assert.equal(calls[0].url, "http://example.test/api/v1/nutrition/recommend");
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[0].options.headers["content-type"], "application/json");
});

test("client attaches bearer token", async () => {
  const client = new FairHarvestClient({
    accessToken: "token-123",
    fetchImpl: async (_url, options) => {
      assert.equal(options.headers.authorization, "Bearer token-123");
      return Response.json({ success: true, data: {}, message: "OK" });
    }
  });

  await client.me();
});

test("client supports product listing management routes", async () => {
  const urls = [];
  const client = new FairHarvestClient({
    baseUrl: "http://example.test",
    fetchImpl: async (url) => {
      urls.push(url);
      return Response.json({ success: true, data: {}, message: "OK" });
    }
  });

  await client.listProducts({ farmer_id: "f001", category: "vegetable" });
  await client.createProduct({ product_id: "p1" });
  await client.updateProduct("p1", { price_bdt: 100 });

  assert.equal(urls[0], "http://example.test/api/v1/products?farmer_id=f001&category=vegetable");
  assert.equal(urls[1], "http://example.test/api/v1/products");
  assert.equal(urls[2], "http://example.test/api/v1/products/p1");
});

test("client supports commerce routes", async () => {
  const urls = [];
  const methods = [];
  const client = new FairHarvestClient({
    baseUrl: "http://example.test",
    fetchImpl: async (url, options) => {
      urls.push(url);
      methods.push(options.method);
      return Response.json({ success: true, data: {}, message: "OK" });
    }
  });

  await client.cart("u001");
  await client.addCartItem("u001", { product_id: "abc123", quantity_kg: 1 });
  await client.pushPrescriptionCart("u001", { consultation_id: "c1", doctor_id: "d1", items: [] });
  await client.checkout("u001", { delivery_address: { line1: "House 1", city: "Dhaka" } });
  await client.clearCart("u001");

  assert.deepEqual(urls, [
    "http://example.test/api/v1/cart/u001",
    "http://example.test/api/v1/cart/u001/items",
    "http://example.test/api/v1/cart/u001/prescription",
    "http://example.test/api/v1/orders/u001/checkout",
    "http://example.test/api/v1/cart/u001"
  ]);
  assert.deepEqual(methods, ["GET", "POST", "POST", "POST", "DELETE"]);
});
