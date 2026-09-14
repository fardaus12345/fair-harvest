// Shared masking helper so sensitive identifiers (NID numbers, Farmer Card
// numbers) are never returned in full by any API response — including to
// admins, per the platform's data-handling rules. Only the last 4 characters
// are shown; everything else is replaced with a bullet.
export function maskIdentifier(value) {
  if (!value) return null;
  const str = String(value);
  if (str.length <= 4) return "*".repeat(str.length);
  return `${"*".repeat(str.length - 4)}${str.slice(-4)}`;
}
