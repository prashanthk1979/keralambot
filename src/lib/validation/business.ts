import { z } from "zod";

export const E164PhoneZ = z
  .string()
  .trim()
  .regex(/^\+91\d{10}$/, "Phone must be in +91XXXXXXXXXX format");

export const LatZ = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "string" ? Number(v) : v))
  .refine((n) => Number.isFinite(n) && n >= -90 && n <= 90, "Invalid latitude");

export const LngZ = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "string" ? Number(v) : v))
  .refine(
    (n) => Number.isFinite(n) && n >= -180 && n <= 180,
    "Invalid longitude"
  );

export function assertNotWithinNext150Minutes(scheduledForISO: string) {
  const scheduled = new Date(scheduledForISO);
  if (Number.isNaN(scheduled.getTime())) {
    throw new Error("Invalid scheduled_for datetime");
  }
  const now = Date.now();
  const min = now + 150 * 60 * 1000;
  if (scheduled.getTime() < min) {
    throw new Error("Scheduling must be at least 2.5 hours from now");
  }
}

export function wordCount(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function assertCancelReason10to150Words(reason: string) {
  const wc = wordCount(reason);
  if (wc < 10 || wc > 150) {
    throw new Error("Cancellation reason must be between 10 and 150 words");
  }
}

