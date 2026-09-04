import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "./respond.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

export function decodeToken(request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { userId: payload.sub, role: payload.role, email: payload.email };
  } catch {
    return null;
  }
}

export function requireUser(request) {
  const session = decodeToken(request);
  if (!session) throw new ApiError("Authentication required", 401);
  return session;
}

export function requireRole(request, roles) {
  const session = requireUser(request);
  if (!roles.includes(session.role)) {
    throw new ApiError("You do not have permission to perform this action", 403);
  }
  return session;
}

export function requireOwnerOrRole(request, ownerId, roles) {
  const session = requireUser(request);
  if (session.userId === ownerId || roles.includes(session.role)) return session;
  throw new ApiError("You do not have permission to perform this action", 403);
}
