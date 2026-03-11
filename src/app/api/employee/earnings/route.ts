import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

async function countCompleted(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  employeeProfileId: string,
  from: Date,
  to: Date
) {
  const { count, error } = await admin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("status", "COMPLETED")
    .eq("created_by_employee_profile_id", employeeProfileId)
    .gte("completed_at", from.toISOString())
    .lte("completed_at", to.toISOString());
  if (error) throw error;
  return count ?? 0;
}

async function countBookedTotal(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  employeeProfileId: string
) {
  const { count, error } = await admin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("created_by_employee_profile_id", employeeProfileId);
  if (error) throw error;
  return count ?? 0;
}

export async function GET() {
  try {
    const server = await createSupabaseServerClient();
    const { data: auth } = await server.auth.getUser();
    const email = auth.user?.email?.toLowerCase() ?? "";
    if (!email.endsWith("@e.keralambot.com") && email !== "prashanthk1979@gmail.com") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const authUserId = auth.user?.id;
    if (!authUserId) {
      return NextResponse.json({ ok: false, error: "Unauthenticated" }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("id,role")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile || (profile.role !== "EMPLOYEE" && profile.role !== "ADMIN")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const todayFrom = startOfDay(now);
    const todayTo = endOfDay(now);
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const yesterdayFrom = startOfDay(y);
    const yesterdayTo = endOfDay(y);

    const thisMonthFrom = startOfMonth(now);
    const thisMonthTo = endOfMonth(now);

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const lastMonthFrom = startOfMonth(lastMonth);
    const lastMonthTo = endOfMonth(lastMonth);

    const [closedToday, closedYesterday, closedThisMonth, closedLastMonth, bookedTotal] =
      await Promise.all([
        countCompleted(admin, profile.id, todayFrom, todayTo),
        countCompleted(admin, profile.id, yesterdayFrom, yesterdayTo),
        countCompleted(admin, profile.id, thisMonthFrom, thisMonthTo),
        countCompleted(admin, profile.id, lastMonthFrom, lastMonthTo),
        countBookedTotal(admin, profile.id),
      ]);

    const rupeesPerClosed = 40;
    return NextResponse.json({
      ok: true,
      rupeesPerClosed,
      closedToday,
      closedYesterday,
      closedThisMonth,
      closedLastMonth,
      earnedToday: closedToday * rupeesPerClosed,
      earnedYesterday: closedYesterday * rupeesPerClosed,
      earnedThisMonth: closedThisMonth * rupeesPerClosed,
      earnedLastMonth: closedLastMonth * rupeesPerClosed,
      bookedTotal,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

