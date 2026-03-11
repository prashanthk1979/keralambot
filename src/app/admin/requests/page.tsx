"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LinkButton } from "@/components/link-button";

type BookingRow = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "CANCELLED" | "COMPLETED";
  created_at: string;
  scheduled_for: string;
  customer_name: string | null;
  customer_phone_e164: string | null;
  customer_address: string | null;
  service_subcategory_text: string | null;
  location_lat: number | null;
  location_lng: number | null;
  vendor_profile_id: string | null;
  service_categories: { name: string } | null;
};

function fmt(dt: string) {
  const d = new Date(dt);
  return Number.isNaN(d.getTime()) ? dt : d.toLocaleString();
}

export default function AdminRequestsPage() {
  const [status, setStatus] = React.useState<BookingRow["status"]>("PENDING");
  const [rows, setRows] = React.useState<BookingRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function load(nextStatus: BookingRow["status"]) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/requests?status=${nextStatus}&limit=100`);
      const json = (await res.json()) as any;
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Failed");
      setRows(json.bookings as BookingRow[]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,242,254,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_80%,rgba(255,126,95,0.10),transparent_55%)]" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Admin — Live Request Sheet
          </h1>
          <p className="mt-1 text-sm text-white/65">
            Real-time operational listing by status. (Requires admin login)
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton
            href="/admin/assign"
            variant="outline"
            className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            Assign vendor
          </LinkButton>
          <LinkButton
            href="/employee/dashboard"
            variant="outline"
            className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            Employee earnings
          </LinkButton>
        </div>
      </div>

      <Card className="mt-6 rounded-[28px] border-white/10 bg-white/10 p-4 backdrop-blur md:p-6">
        <Tabs value={status} onValueChange={(v) => setStatus(v as any)}>
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white/5">
            <TabsTrigger value="PENDING">PENDING</TabsTrigger>
            <TabsTrigger value="ACCEPTED">ACCEPTED</TabsTrigger>
            <TabsTrigger value="COMPLETED">COMPLETED</TabsTrigger>
            <TabsTrigger value="CANCELLED">CANCELLED</TabsTrigger>
          </TabsList>

          <TabsContent value={status} className="mt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm text-white/70">
                {loading ? "Loading..." : err ? `Error: ${err}` : `${rows.length} requests`}
              </div>
              <button
                type="button"
                onClick={() => load(status)}
                className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
              >
                Refresh
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vendor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} className="hover:bg-white/5">
                      <TableCell className="font-mono text-xs text-white/80">
                        {r.id}
                      </TableCell>
                      <TableCell className="text-sm text-white">
                        {r.service_categories?.name ?? "-"}
                        {r.service_subcategory_text ? (
                          <div className="text-xs text-white/55">
                            {r.service_subcategory_text}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-white/80">
                        <div>{r.customer_name ?? "-"}</div>
                        <div className="text-xs text-white/55">
                          {r.customer_phone_e164 ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-white/80">
                        <div className="text-xs text-white/55">
                          Created: {fmt(r.created_at)}
                        </div>
                        <div>{fmt(r.scheduled_for)}</div>
                      </TableCell>
                      <TableCell className="text-sm text-white/80">
                        {r.status}
                      </TableCell>
                      <TableCell className="text-xs text-white/55">
                        {r.vendor_profile_id ? (
                          <span className="font-mono">{r.vendor_profile_id}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!rows.length && !loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-sm text-white/60">
                        No requests.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}

