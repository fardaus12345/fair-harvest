// Kept dependency-free (no "next/server" import) so modules that only need
// to throw/catch this error — like rateLimit.js — can be unit-tested with
// plain `node --test`, without pulling in the Next.js runtime.
export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
