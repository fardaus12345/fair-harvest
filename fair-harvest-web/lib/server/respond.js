import { NextResponse } from "next/server";

export function ok(data, { message = "OK", status = 200 } = {}) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function fail(message, { status = 400, data = null } = {}) {
  return NextResponse.json({ success: false, data, message }, { status });
}

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function handleRoute(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ApiError) {
      return fail(error.message, { status: error.status });
    }
    console.error(error);
    return fail("Internal server error", { status: 500 });
  }
}
