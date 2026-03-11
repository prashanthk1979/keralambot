import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const server = await createSupabaseServerClient();
  const { data: auth } = await server.auth.getUser();
  const email = auth.user?.email?.toLowerCase() ?? "";
  if (!email.endsWith("@v.keralambot.com")) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  const authUserId = auth.user?.id;
  if (!authUserId) {
    return NextResponse.json({ ok: false, error: "Unauthenticated" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  // vendor profile by auth_user_id
  const { data: vendor, error: vErr } = await admin
    .from("profiles")
    .select("id,role,vendor_status")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (vErr) throw vErr;
  if (!vendor || vendor.role !== "VENDOR" || vendor.vendor_status !== "APPROVED") {
    return NextResponse.json({ ok: false, error: "Vendor not approved" }, { status: 403 });
  }

  // booking must be assigned to vendor and PENDING
  const { data: booking, error: bErr } = await admin
    .from("bookings")
    .select("id,status,vendor_profile_id")
    .eq("id", id)
    .single();
  if (bErr) throw bErr;
  if (booking.vendor_profile_id !== vendor.id) {
    return NextResponse.json({ ok: false, error: "Not your booking" }, { status: 403 });
  }
  if (booking.status !== "PENDING") {
    return NextResponse.json({ ok: false, error: "Booking is not PENDING" }, { status: 400 });
  }

  const { data: updated, error: updErr } = await admin
    .from("bookings")
    .update({ status: "ACCEPTED", accepted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id,status,accepted_at")
    .single();
  if (updErr) throw updErr;

  return NextResponse.json({ ok: true, booking: updated });
}

