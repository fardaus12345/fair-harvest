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
