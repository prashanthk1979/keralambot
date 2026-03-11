import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { E164PhoneZ, LatZ, LngZ } from "@/lib/validation/business";

const VendorSignupZ = z.object({
  name: z.string().trim().min(2).max(120),
  primaryMobile: E164PhoneZ,
  altMobiles: z.array(E164PhoneZ).max(5).optional().nullable(),
  address: z.string().trim().min(4).max(400),

  aadhaar: z.string().trim().min(4).max(30).optional().nullable(),
  pan: z.string().trim().min(4).max(30).optional().nullable(),
  municipalLicenseId: z.string().trim().min(2).max(60).optional().nullable(),

  shopLat: LatZ,
  shopLng: LngZ,
  serviceRadiusKm: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "string" ? Number(v) : v))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 200, "Invalid KM range"),

  servicesOffered: z.array(z.string().min(2)).min(1).max(30),
});

export async function POST(req: Request) {
  try {
    const input = VendorSignupZ.parse(await req.json());
    const supabase = createSupabaseAdminClient();

    // Ensure services exist and map to IDs
    const { data: categories, error: catErr } = await supabase
      .from("service_categories")
      .select("id,name")
      .in("name", input.servicesOffered);
    if (catErr) throw catErr;

    const found = new Map((categories ?? []).map((c) => [c.name, c.id] as const));
    const missing = input.servicesOffered.filter((n) => !found.has(n));
    if (missing.length) {
      return NextResponse.json(
        { ok: false, error: `Unknown services: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // Create vendor profile (or update if phone already exists as vendor)
    const { data: existingVendor, error: vendorFindErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone_e164", input.primaryMobile)
      .eq("role", "VENDOR")
      .maybeSingle();
    if (vendorFindErr) throw vendorFindErr;

    const baseProfile = {
      role: "VENDOR" as const,
      full_name: input.name,
      phone_e164: input.primaryMobile,
      alt_phones_e164: input.altMobiles ?? null,
      vendor_address: input.address,
      vendor_aadhaar: input.aadhaar ?? null,
      vendor_pan: input.pan ?? null,
      vendor_shop_municipal_license_id: input.municipalLicenseId ?? null,
      shop_lat: input.shopLat,
      shop_lng: input.shopLng,
      service_radius_km: Math.round(input.serviceRadiusKm),
      vendor_status: "PENDING",
    };

    let vendorProfileId: string;
    if (existingVendor?.id) {
      const { data: updated, error: updErr } = await supabase
        .from("profiles")
        .update(baseProfile)
        .eq("id", existingVendor.id)
        .select("id")
        .single();
      if (updErr) throw updErr;
      vendorProfileId = updated.id;
    } else {
      const { data: created, error: createErr } = await supabase
        .from("profiles")
        .insert(baseProfile)
        .select("id")
        .single();
      if (createErr) throw createErr;
      vendorProfileId = created.id;
    }

    // Replace vendor_services rows
    await supabase
      .from("vendor_services")
      .delete()
      .eq("vendor_profile_id", vendorProfileId);

    const rows = input.servicesOffered.map((name) => ({
      vendor_profile_id: vendorProfileId,
      category_id: found.get(name)!,
    }));
    const { error: vsErr } = await supabase.from("vendor_services").insert(rows);
    if (vsErr) throw vsErr;

    return NextResponse.json({ ok: true, vendorProfileId });
  } catch (err) {
    const msg =
      err instanceof z.ZodError
        ? err.issues.map((i) => i.message).join(", ")
        : err instanceof Error
          ? err.message
          : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

