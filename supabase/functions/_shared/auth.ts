// deno-lint-ignore-file no-explicit-any
// @ts-nocheck
import * as djwt from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { hash, verify } from "https://deno.land/x/argon2@v0.3.0/mod.ts";

export const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

export type JwtClaims = {
  sub: string;                // accounts.id
  role: "authenticated";
  account_role: "user" | "admin";
  iat: number;
  exp: number;
};

export async function signJwt(claims: JwtClaims) {
  return await djwt.create({ alg: "HS256", typ: "JWT" }, claims as any, JWT_SECRET);
}

export function newSaltBase64(bytes = 16) {
  const salt = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...salt));
}

export async function hashPin(pin: string, saltB64: string) {
  // Argon2 manages its own salt too; we add one more layer so format is flexible for future changes.
  return await hash(`${pin}:${saltB64}`);
}

export async function verifyPin(pin: string, saltB64: string, pinHash: string) {
  return await verify(pinHash, `${pin}:${saltB64}`);
}
