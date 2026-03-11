import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const AddComplaintZ = z.object({
  bookingId: z.string().uuid(),
  note: z.string().trim().min(3).max(1500),
});

export async function POST(req: Request) {
  try {
    const server = await createSupabaseServerClient();
    const { data: auth } = await server.auth.getUser();
    const authUserId = auth.user?.id;
    if (!authUserId) {
      return NextResponse.json({ ok: false, error: "Unauthenticated" }, { status: 401 });
    }

    const input = AddComplaintZ.parse(await req.json());
    const admin = createSupabaseAdminClient();

    const { data: author, error: aErr } = await admin
      .from("profiles")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();
    if (aErr) throw aErr;

    // Max 30 notes total per order
    const { count: totalCount, error: totalErr } = await admin
      .from("complaint_notes")
      .select("id", { count: "exact", head: true })
      .eq("booking_id", input.bookingId);
    if (totalErr) throw totalErr;
    if ((totalCount ?? 0) >= 30) {
      return NextResponse.json(
        { ok: false, error: "Maximum 30 complaint notes per order" },
        { status: 400 }
      );
    }

    // Max 2 notes per day per order per author
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const { count: dailyCount, error: dailyErr } = await admin
      .from("complaint_notes")
      .select("id", { count: "exact", head: true })
      .eq("booking_id", input.bookingId)
      .eq("author_profile_id", author.id)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());
    if (dailyErr) throw dailyErr;
    if ((dailyCount ?? 0) >= 2) {
      return NextResponse.json(
        { ok: false, error: "Maximum 2 complaint notes per day" },
        { status: 400 }
      );
    }

    const { data: created, error: cErr } = await admin
      .from("complaint_notes")
      .insert({
        booking_id: input.bookingId,
        author_profile_id: author.id,
        note: input.note,
      })
      .select("id,created_at")
      .single();
    if (cErr) throw cErr;

    return NextResponse.json({ ok: true, complaint: created });
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

