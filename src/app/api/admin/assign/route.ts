import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const AssignVendorZ = z.object({
  bookingId: z.string().uuid(),
  vendorProfileId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const server = await createSupabaseServerClient();
    const { data: auth } = await server.auth.getUser();
    const email = auth.user?.email?.toLowerCase() ?? "";
    if (email !== "prashanthk1979@gmail.com") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const input = AssignVendorZ.parse(await req.json());
    const admin = createSupabaseAdminClient();

    // booking must be PENDING
    const { data: booking, error: bErr } = await admin
      .from("bookings")
      .select("id,status")
      .eq("id", input.bookingId)
      .single();
    if (bErr) throw bErr;
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { ok: false, error: "Only PENDING bookings can be assigned" },
        { status: 400 }
      );
    }

    // vendor must be approved VENDOR
    const { data: vendor, error: vErr } = await admin
      .from("profiles")
      .select("id,role,vendor_status")
      .eq("id", input.vendorProfileId)
      .single();
    if (vErr) throw vErr;
    if (vendor.role !== "VENDOR" || vendor.vendor_status !== "APPROVED") {
      return NextResponse.json(
        { ok: false, error: "Vendor is not approved" },
        { status: 400 }
      );
    }

    const { data: updated, error: updErr } = await admin
      .from("bookings")
      .update({ vendor_profile_id: input.vendorProfileId })
      .eq("id", input.bookingId)
      .select("id,vendor_profile_id,status")
      .single();
    if (updErr) throw updErr;

    return NextResponse.json({ ok: true, booking: updated });
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

