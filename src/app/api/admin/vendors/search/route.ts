import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { haversineKm } from "@/lib/geo/distance";

const QueryZ = z.object({
  bookingId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export async function GET(req: Request) {
  try {
    const server = await createSupabaseServerClient();
    const { data: auth } = await server.auth.getUser();
    const email = auth.user?.email?.toLowerCase() ?? "";
    if (email !== "prashanthk1979@gmail.com") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const input = QueryZ.parse({
      bookingId: url.searchParams.get("bookingId"),
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const admin = createSupabaseAdminClient();

    const { data: booking, error: bErr } = await admin
      .from("bookings")
      .select("id,service_category_id,location_lat,location_lng,status")
      .eq("id", input.bookingId)
      .single();
    if (bErr) throw bErr;
    if (!booking.location_lat || !booking.location_lng) {
      return NextResponse.json(
        { ok: false, error: "Booking has no location" },
        { status: 400 }
      );
    }

    // Candidate vendors: approved + have coordinates + radius + offer category
    // We do this in two steps (simple, portable):
    // 1) find vendor IDs from vendor_services
    const { data: vs, error: vsErr } = await admin
      .from("vendor_services")
      .select("vendor_profile_id")
      .eq("category_id", booking.service_category_id);
    if (vsErr) throw vsErr;

    const vendorIds = Array.from(new Set((vs ?? []).map((r) => r.vendor_profile_id)));
    if (!vendorIds.length) return NextResponse.json({ ok: true, vendors: [] });

    // 2) load vendor profiles
    const { data: vendors, error: vErr } = await admin
      .from("profiles")
      .select(
        "id,full_name,phone_e164,vendor_address,shop_lat,shop_lng,service_radius_km,vendor_status"
      )
      .in("id", vendorIds)
      .eq("role", "VENDOR")
      .eq("vendor_status", "APPROVED");
    if (vErr) throw vErr;

    const bookingLoc = { lat: booking.location_lat, lng: booking.location_lng };

    const results = (vendors ?? [])
      .filter((v) => v.shop_lat != null && v.shop_lng != null && v.service_radius_km != null)
      .map((v) => {
        const distKm = haversineKm(
          { lat: v.shop_lat as number, lng: v.shop_lng as number },
          bookingLoc
        );
        const radiusKm = v.service_radius_km as number;
        return {
          id: v.id as string,
          full_name: v.full_name as string | null,
          phone_e164: v.phone_e164 as string | null,
          vendor_address: v.vendor_address as string | null,
          service_radius_km: radiusKm,
          distance_km: Number(distKm.toFixed(2)),
          in_range: distKm <= radiusKm,
        };
      })
      .filter((v) => v.in_range)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, input.limit ?? 50);

    return NextResponse.json({ ok: true, vendors: results });
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

