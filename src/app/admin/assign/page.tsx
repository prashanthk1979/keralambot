"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/link-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminAssignPage() {
  const [bookingId, setBookingId] = React.useState("");
  const [vendorProfileId, setVendorProfileId] = React.useState("");
  const [status, setStatus] = React.useState<
    { kind: "idle" } | { kind: "ok" } | { kind: "err"; msg: string }
  >({ kind: "idle" });
  const [loading, setLoading] = React.useState(false);

  const [searchLoading, setSearchLoading] = React.useState(false);
  const [vendors, setVendors] = React.useState<
    Array<{
      id: string;
      full_name: string | null;
      phone_e164: string | null;
      vendor_address: string | null;
      service_radius_km: number;
      distance_km: number;
    }>
  >([]);

  async function assign() {
    setLoading(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId, vendorProfileId }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Failed");
      setStatus({ kind: "ok" });
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }

  async function searchVendors() {
    if (!bookingId) return;
    setSearchLoading(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch(
        `/api/admin/vendors/search?bookingId=${encodeURIComponent(bookingId)}&limit=50`
      );
      const json = (await res.json()) as any;
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Failed");
      setVendors(json.vendors ?? []);
    } catch (e) {
      setVendors([]);
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Failed" });
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,242,254,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_80%,rgba(255,126,95,0.10),transparent_55%)]" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Admin — Assign vendor to request
          </h1>
          <p className="mt-1 text-sm text-white/65">
            Assign a vendor profile to a PENDING booking. (Requires admin login)
          </p>
        </div>
        <LinkButton
          href="/employee/officelogin"
          variant="outline"
          className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          Employee CRM
        </LinkButton>
      </div>

      <Card className="mt-6 rounded-[28px] border-white/10 bg-white/10 p-6 backdrop-blur">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label className="text-white/80">Booking ID</Label>
            <Input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="UUID"
              className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={!bookingId || searchLoading}
                onClick={searchVendors}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-white/10 px-4 text-sm text-white hover:bg-white/15 disabled:opacity-60"
              >
                {searchLoading ? "Searching..." : "Find nearby vendors"}
              </button>
              <LinkButton
                href="/admin/requests"
                variant="outline"
                className="h-10 rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                Live Request Sheet
              </LinkButton>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Vendor Profile ID</Label>
            <Input
              value={vendorProfileId}
              onChange={(e) => setVendorProfileId(e.target.value)}
              placeholder="UUID"
              className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {status.kind === "ok" ? (
                <span className="text-emerald-300">Assigned successfully.</span>
              ) : status.kind === "err" ? (
                <span className="text-rose-300">{status.msg}</span>
              ) : (
                <span className="text-white/60">Ready</span>
              )}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={assign}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#00F2FE] px-5 text-sm font-medium text-[#0A192F] transition hover:bg-[#00F2FE]/90 disabled:opacity-60"
            >
              {loading ? "Assigning..." : "Assign vendor"}
            </button>
          </div>

          {vendors.length ? (
            <div className="mt-2 overflow-hidden rounded-3xl border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Radius</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((v) => (
                    <TableRow key={v.id} className="hover:bg-white/5">
                      <TableCell className="text-sm text-white/85">
                        <div className="font-medium text-white">{v.full_name ?? "Vendor"}</div>
                        <div className="text-xs text-white/55">{v.phone_e164 ?? ""}</div>
                        <div className="text-xs text-white/55">{v.vendor_address ?? ""}</div>
                      </TableCell>
                      <TableCell className="text-sm text-white/80">
                        {v.distance_km} km
                      </TableCell>
                      <TableCell className="text-sm text-white/80">
                        {v.service_radius_km} km
                      </TableCell>
                      <TableCell className="font-mono text-xs text-white/70">{v.id}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => setVendorProfileId(v.id)}
                          className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
                        >
                          Select
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </div>
      </Card>
    </main>
  );
}

