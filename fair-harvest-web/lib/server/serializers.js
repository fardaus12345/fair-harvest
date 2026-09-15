import { maskIdentifier } from "./mask.js";

export function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role.toLowerCase(),
    status: user.status.toLowerCase(),
    farmer_profile_id: user.farmerProfile ? user.farmerProfile.id : null,
    farmer_verification_status: user.farmerProfile ? user.farmerProfile.verificationStatus.toLowerCase() : null
  };
}

export function toPublicProduct(product) {
  return {
    product_id: product.id,
    farmer_id: product.farmerId,
    farmer_name: product.farmer?.user?.name,
    farmer_district: product.farmer?.district,
    farmer_verification_status: product.farmer?.verificationStatus ? product.farmer.verificationStatus.toLowerCase() : undefined,
    name: product.name,
    category: product.category,
    description: product.description || "",
    price_bdt: product.priceBdt,
    quantity_kg: product.quantityKg,
    freshness_window_days: product.freshnessWindowDays,
    trust_score: product.trustScore,
    image_url: product.imageUrl || null,
    status: product.status.toLowerCase(),
    created_at: product.createdAt
  };
}

export function toPublicCart(userId, cart) {
  const items = (cart?.items || []).map((item) => ({
    cart_item_id: item.id,
    product_id: item.productId,
    name: item.product.name,
    image_url: item.product.imageUrl || null,
    price_bdt: item.unitPriceBdt,
    quantity_kg: item.quantityKg,
    source: item.source.toLowerCase(),
    line_total_bdt: Number((item.unitPriceBdt * item.quantityKg).toFixed(2))
  }));
  const subtotal = Number(items.reduce((sum, item) => sum + item.line_total_bdt, 0).toFixed(2));
  return { user_id: userId, items, subtotal_bdt: subtotal, item_count: items.length };
}

export function toPublicOrder(order) {
  return {
    order_id: order.id,
    user_id: order.userId,
    status: order.status.toLowerCase(),
    total_bdt: order.totalBdt,
    delivery_fee_bdt: order.deliveryFeeBdt,
    delivery_address: { line1: order.deliveryLine1, city: order.deliveryCity },
    payment_method: order.paymentMethod.toLowerCase(),
    payment_status: order.paymentStatus.toLowerCase(),
    created_at: order.createdAt,
    items: (order.items || []).map((item) => ({
      order_item_id: item.id,
      product_id: item.productId,
      farmer_id: item.farmerId,
      name: item.nameSnapshot,
      image_url: item.product?.imageUrl || null,
      quantity_kg: item.quantityKg,
      unit_price_bdt: item.unitPriceBdt,
      line_total_bdt: item.lineTotalBdt
    })),
    status_events: (order.statusEvents || [])
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((event) => ({ status: event.status.toLowerCase(), note: event.note || null, created_at: event.createdAt }))
  };
}

export function toAdminFarmer(profile) {
  return {
    farmer_id: profile.id,
    user_id: profile.userId,
    name: profile.user.name,
    email: profile.user.email,
    phone: profile.user.phone,
    account_status: profile.user.status.toLowerCase(),
    district: profile.district,
    // Never expose full NID / Farmer Card numbers, even to admins — masked
    // consistently everywhere this data leaves the server (see lib/server/mask.js).
    farmer_card_number_masked: maskIdentifier(profile.farmerCardNumber),
    nid_number_masked: maskIdentifier(profile.nidNumber),
    verification_status: profile.verificationStatus.toLowerCase(),
    verification_method: profile.verificationMethod ? profile.verificationMethod.toLowerCase() : null,
    verified_at: profile.verifiedAt,
    reputation_score: profile.reputationScore,
    badge: profile.badge,
    product_count: profile._count?.products ?? 0,
    created_at: profile.createdAt
  };
}

export function toAdminCustomer(user) {
  return {
    user_id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status.toLowerCase(),
    order_count: user._count?.orders ?? 0,
    created_at: user.createdAt
  };
}

export function toAdminOrder(order) {
  return {
    ...toPublicOrder(order),
    customer_name: order.user?.name,
    customer_email: order.user?.email
  };
}

const TRACE_STAGE_LABELS = {
  PLANTED: "Planted",
  HARVESTED: "Harvested",
  LAB_TESTED: "Lab tested",
  PACKAGED: "Packaged",
  SHIPPED: "Shipped",
  LISTED: "Listed"
};
const TRACE_STAGE_ORDER = Object.keys(TRACE_STAGE_LABELS);

export function toPublicTrace(product, traceEvents) {
  const stage = {};
  for (const event of traceEvents) stage[event.stage] = event;
  const gps = stage.HARVESTED || stage.PLANTED;

  return {
    product_id: product.id,
    farmer: {
      name: product.farmer.user.name,
      location: { lat: gps?.gpsLat ?? null, lng: gps?.gpsLng ?? null },
      certifications: ["Bangladesh Organic Standard"]
    },
    farm_gps_location: { lat: gps?.gpsLat ?? null, lng: gps?.gpsLng ?? null },
    harvest_date: stage.HARVESTED?.timestamp ?? null,
    processing_timestamp: stage.LAB_TESTED?.timestamp ?? null,
    shipping_timestamp: stage.SHIPPED?.timestamp ?? null,
    shipping_date: stage.SHIPPED?.timestamp ?? null,
    // trace_events: the real, growing event log the farmer builds up. Steps
    // with no matching event yet are "pending" — no fabricated timestamps.
    trace_events: TRACE_STAGE_ORDER.map((key) => ({
      stage: key,
      label: TRACE_STAGE_LABELS[key],
      completed: Boolean(stage[key]),
      timestamp: stage[key]?.timestamp ?? null,
      note: stage[key]?.note ?? null,
      gps_lat: stage[key]?.gpsLat ?? null,
      gps_lng: stage[key]?.gpsLng ?? null
    })),
    current_freshness_days: product.freshnessWindowDays,
    // No blockchain or external ledger is integrated. This is intentionally
    // not present as a "verified_on_chain" boolean — that would misrepresent
    // a database record as an on-chain fact.
    qr_code: `qr_${product.id}`,
    ledger_type: "database",
    verification_note: "Traceability data is stored in the Fair Harvest database and entered by the farmer. No blockchain or third-party ledger is used."
  };
}

const REWARD_BADGES = [
  { points: 100, name: "First Harvest" },
  { points: 500, name: "Organic Warrior" },
  { points: 1000, name: "7-Day Streak" },
  { points: 2500, name: "Zero Pesticide Week" },
  { points: 5000, name: "Health Champion" }
];

export function toPublicRewards(userId, ledgerEntries) {
  const points = ledgerEntries.reduce((sum, entry) => sum + entry.points, 0);
  const streakDays = new Set(ledgerEntries.map((entry) => new Date(entry.createdAt).toDateString())).size;
  const badges = REWARD_BADGES.filter((badge) => points >= badge.points).map((badge) => badge.name);

  return {
    user_id: userId,
    points,
    reward_points: points,
    streak_days: streakDays,
    healthy_order_streak_days: streakDays,
    badges,
    recent_activity: ledgerEntries.slice(0, 5).map((entry) => ({
      reason: entry.reason,
      points: entry.points,
      created_at: entry.createdAt
    }))
  };
}

export function toPublicFarmerProfile(profile) {
  return {
    farmer_id: profile.id,
    user_id: profile.userId,
    name: profile.user?.name,
    district: profile.district,
    verification_status: profile.verificationStatus.toLowerCase(),
    verification_method: profile.verificationMethod ? profile.verificationMethod.toLowerCase() : null,
    verified_at: profile.verifiedAt,
    reputation_score: profile.reputationScore,
    badge: profile.badge
  };
}
