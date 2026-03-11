import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const SendMessageZ = z.object({
  bookingId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export async function POST(req: Request) {
  try {
    const server = await createSupabaseServerClient();
    const { data: auth } = await server.auth.getUser();
    const authUserId = auth.user?.id;
    if (!authUserId) {
      return NextResponse.json({ ok: false, error: "Unauthenticated" }, { status: 401 });
    }

    const input = SendMessageZ.parse(await req.json());
    const admin = createSupabaseAdminClient();

    const { data: sender, error: sErr } = await admin
      .from("profiles")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();
    if (sErr) throw sErr;

    const { data: booking, error: bErr } = await admin
      .from("bookings")
      .select("id,status,customer_profile_id,vendor_profile_id")
      .eq("id", input.bookingId)
      .single();
    if (bErr) throw bErr;

    if (booking.status !== "ACCEPTED") {
      return NextResponse.json(
        { ok: false, error: "Chat is enabled only when booking is ACCEPTED" },
        { status: 400 }
      );
    }

    const allowed =
      sender.id === booking.customer_profile_id ||
      sender.id === booking.vendor_profile_id;
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const { data: msg, error: mErr } = await admin
      .from("messages")
      .insert({
        booking_id: input.bookingId,
        sender_profile_id: sender.id,
        body: input.body,
      })
      .select("id,created_at")
      .single();
    if (mErr) throw mErr;

    return NextResponse.json({ ok: true, message: msg });
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

