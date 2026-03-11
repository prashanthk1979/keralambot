import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { assertNotWithinNext150Minutes, E164PhoneZ, LatZ, LngZ } from "@/lib/validation/business";

const CreateBookingZ = z.object({
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
    const body = await req.json();
    const input = CreateBookingZ.parse(body);
    assertNotWithinNext150Minutes(input.scheduledFor);

    const supabase = createSupabaseAdminClient();

    // 1) Ensure service category exists (or map by name)
    const { data: category, error: catErr } = await supabase
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

    // 2) Upsert/insert a CUSTOMER profile based on phone (lightweight, no auth yet)
    const { data: existingCustomer, error: custFindErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone_e164", input.customerMobile)
      .eq("role", "CUSTOMER")
      .maybeSingle();
    if (custFindErr) throw custFindErr;

    let customerProfileId = existingCustomer?.id as string | undefined;
    if (!customerProfileId) {
      const { data: createdCustomer, error: custCreateErr } = await supabase
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

    // 3) Create booking as PENDING, vendor unassigned
    const { data: booking, error: bookErr } = await supabase
      .from("bookings")
      .insert({
        customer_profile_id: customerProfileId,
        vendor_profile_id: null,
        created_by_employee_profile_id: null,
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

