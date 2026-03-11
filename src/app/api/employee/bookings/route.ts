import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  assertNotWithinNext150Minutes,
  E164PhoneZ,
  LatZ,
  LngZ,
} from "@/lib/validation/business";

const EmployeeCreateBookingZ = z.object({
  serviceName: z.string().min(2),
  subCategoryText: z.string().trim().max(120).optional().nullable(),
  scheduledFor: z.string(),

  customerName: z.string().trim().min(2).max(120),
  customerMobile: E164PhoneZ,
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  customerAddress: z.string().trim().min(4).max(300),
  notes: z.string().trim().max(1500).optional().nullable(),

  lat: LatZ,
  lng: LngZ,
});

export async function POST(req: Request) {
  try {
    const server = await createSupabaseServerClient();
    const { data: auth } = await server.auth.getUser();
    const email = auth.user?.email?.toLowerCase() ?? "";
    if (!email.endsWith("@e.keralambot.com") && email !== "prashanthk1979@gmail.com") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const input = EmployeeCreateBookingZ.parse(await req.json());
    assertNotWithinNext150Minutes(input.scheduledFor);

    const admin = createSupabaseAdminClient();

    // Ensure employee profile exists
    const authUserId = auth.user?.id;
    if (!authUserId) {
      return NextResponse.json({ ok: false, error: "Unauthenticated" }, { status: 401 });
    }

    const desiredRole = email === "prashanthk1979@gmail.com" ? "ADMIN" : "EMPLOYEE";
    const { data: employeeIdRow, error: empUpsertErr } = await admin
      .from("profiles")
      .upsert(
        { auth_user_id: authUserId, role: desiredRole, email },
        { onConflict: "auth_user_id" }
      )
      .select("id")
      .single();
    if (empUpsertErr) throw empUpsertErr;

    // Service category
    const { data: category, error: catErr } = await admin
      .from("service_categories")
      .select("id,name")
      .eq("name", input.serviceName)
      .maybeSingle();
    if (catErr) throw catErr;
    if (!category) {
      return NextResponse.json(
        { ok: false, error: "Unknown service category" },
        { status: 400 }
      );
    }

    // Customer profile (by phone)
    const { data: existingCustomer, error: custFindErr } = await admin
      .from("profiles")
      .select("id")
      .eq("phone_e164", input.customerMobile)
      .eq("role", "CUSTOMER")
      .maybeSingle();
    if (custFindErr) throw custFindErr;

    let customerProfileId = existingCustomer?.id as string | undefined;
    if (!customerProfileId) {
      const { data: createdCustomer, error: custCreateErr } = await admin
        .from("profiles")
        .insert({
          role: "CUSTOMER",
          full_name: input.customerName,
          email: input.customerEmail || null,
          phone_e164: input.customerMobile,
        })
        .select("id")
        .single();
      if (custCreateErr) throw custCreateErr;
      customerProfileId = createdCustomer.id;
    }

    const { data: booking, error: bookErr } = await admin
      .from("bookings")
      .insert({
        customer_profile_id: customerProfileId,
        created_by_employee_profile_id: employeeIdRow.id,
        vendor_profile_id: null,
        service_category_id: category.id,
        service_subcategory_text: input.subCategoryText || null,
        customer_name: input.customerName,
        customer_phone_e164: input.customerMobile,
        customer_email: input.customerEmail || null,
        customer_address: input.customerAddress,
        customer_notes: input.notes || null,
        location_lat: input.lat,
        location_lng: input.lng,
        scheduled_for: input.scheduledFor,
        status: "PENDING",
      })
      .select("id,status,created_at")
      .single();
    if (bookErr) throw bookErr;

    return NextResponse.json({ ok: true, booking });
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

