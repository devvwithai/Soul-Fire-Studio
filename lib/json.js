import { NextResponse } from "next/server";

// Safe JSON body parsing for API routes.
// Malformed JSON (or a valid JSON value that isn't an object, e.g. `null`,
// a string, a number or an array) must return a 400 to the client — never
// bubble up as an unhandled 500 from `await req.json()` or destructuring.
// Usage:
//   const parsed = await parseJsonBody(req);
//   if (!parsed.ok) return parsed.response;
//   const { email, password } = parsed.data;
export async function parseJsonBody(req) {
  try {
    const data = await req.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Invalid JSON body." },
          { status: 400 }
        ),
      };
    }
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      ),
    };
  }
}
