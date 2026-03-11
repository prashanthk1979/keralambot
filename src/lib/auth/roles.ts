import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type UserRole = "CUSTOMER" | "VENDOR" | "EMPLOYEE" | "ADMIN";

export async function requireRoleByEmailDomain(email: string | null | undefined) {
  const e = (email ?? "").toLowerCase().trim();
  if (!e) return null;
  if (e === "prashanthk1979@gmail.com") return "ADMIN" as const;
  if (e.endsWith("@e.keralambot.com")) return "EMPLOYEE" as const;
  if (e.endsWith("@v.keralambot.com")) return "VENDOR" as const;
  return "CUSTOMER" as const;
}

export async function getProfileByAuthUserId(authUserId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

