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
