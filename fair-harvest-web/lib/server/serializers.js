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
