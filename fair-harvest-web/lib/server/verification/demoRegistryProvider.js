import { prisma } from "../db.js";

function normalizeName(value) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeRecord(record) {
  return {
    fullName: record.fullName,
    district: record.district,
    issueDate: record.issueDate,
    status: record.status.toLowerCase()
  };
}

export async function verifyWithDemoRegistry({ cardNumber, nidNumber, name }) {
  const record = await prisma.govFarmerCardRecord.findUnique({ where: { cardNumber } });

  if (!record) {
    return { matched: false, confidence: 0, record: null, reason: "card_not_found" };
  }
  if (record.status !== "ACTIVE") {
    return { matched: false, confidence: 0, record: normalizeRecord(record), reason: "card_revoked" };
  }

  const nidMatches = record.nidNumber === nidNumber;
  const nameMatches = normalizeName(record.fullName) === normalizeName(name);

  if (nidMatches && nameMatches) {
    return { matched: true, confidence: 0.98, record: normalizeRecord(record), reason: "matched" };
  }

  return {
    matched: false,
    confidence: nidMatches || nameMatches ? 0.5 : 0.1,
    record: normalizeRecord(record),
    reason: "details_mismatch"
  };
}
