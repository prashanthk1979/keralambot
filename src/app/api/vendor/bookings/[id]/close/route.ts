import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const CloseZ = z.object({
  warrantyNotes: z.string().trim().max(1000).optional().nullable(),
  accessoriesNotes: z.string().trim().max(1000).optional().nullable(),
  platformCommissionRupees: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? Number(v) : v))
    .refine((n) => Number.isFinite(n) && n >= 25, "Minimum platform commission is ₹25"),
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

    const input = CloseZ.parse(await req.json());

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
        { ok: false, error: "Only ACCEPTED bookings can be completed" },
        { status: 400 }
      );
    }

    const { data: updated, error: updErr } = await admin
      .from("bookings")
      .update({
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
        warranty_notes: input.warrantyNotes ?? null,
        accessories_notes: input.accessoriesNotes ?? null,
        platform_commission_rupees: Math.round(input.platformCommissionRupees),
      })
      .eq("id", id)
      .select("id,status,completed_at,platform_commission_rupees")
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

