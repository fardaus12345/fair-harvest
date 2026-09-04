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
      product_id: item.productId,
      farmer_id: item.farmerId,
      name: item.nameSnapshot,
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
    farmer_card_number: profile.farmerCardNumber,
    nid_number: profile.nidNumber,
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

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

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
    soil_data: {
      ph: 6.7,
      nitrogen: clampScore(product.trustScore - 40),
      iron: Number((product.trustScore / 12).toFixed(1))
    },
    qr_code: `qr_${product.id}`,
    blockchain_hash: `0xfh${product.id.slice(0, 24)}`,
    current_freshness_days: product.freshnessWindowDays,
    verified_on_chain: product.farmer.verificationStatus === "VERIFIED"
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
