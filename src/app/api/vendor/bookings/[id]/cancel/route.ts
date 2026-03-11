import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { assertCancelReason10to150Words } from "@/lib/validation/business";

const CancelZ = z.object({
  reason: z.string().trim().min(1),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
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

    const { reason } = CancelZ.parse(await req.json());
    assertCancelReason10to150Words(reason);

    const admin = createSupabaseAdminClient();
    const { data: vendor, error: vErr } = await admin
      .from("profiles")
      .select("id,role")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (vErr) throw vErr;
    if (!vendor || vendor.role !== "VENDOR") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { data: booking, error: bErr } = await admin
      .from("bookings")
      .select("id,status,vendor_profile_id")
      .eq("id", id)
      .single();
    if (bErr) throw bErr;
    if (booking.vendor_profile_id !== vendor.id) {
      return NextResponse.json({ ok: false, error: "Not your booking" }, { status: 403 });
    }
    if (booking.status !== "ACCEPTED") {
      return NextResponse.json(
        { ok: false, error: "Only ACCEPTED bookings can be cancelled by vendor" },
        { status: 400 }
      );
    }

    const { data: updated, error: updErr } = await admin
      .from("bookings")
      .update({ status: "CANCELLED", vendor_cancel_reason: reason })
      .eq("id", id)
      .select("id,status")
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

