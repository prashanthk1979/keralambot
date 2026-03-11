import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const QueryZ = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "CANCELLED", "COMPLETED"]).optional(),
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
    const parsed = QueryZ.parse({
      status: url.searchParams.get("status") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const admin = createSupabaseAdminClient();
    let q = admin
      .from("bookings")
      .select(
        "id,status,created_at,scheduled_for,customer_name,customer_phone_e164,customer_address,service_subcategory_text,location_lat,location_lng,vendor_profile_id,service_categories(name)",
      )
      .order("created_at", { ascending: false })
      .limit(parsed.limit ?? 50);

    if (parsed.status) q = q.eq("status", parsed.status);

    const { data, error } = await q;
    if (error) throw error;

    return NextResponse.json({ ok: true, bookings: data ?? [] });
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

