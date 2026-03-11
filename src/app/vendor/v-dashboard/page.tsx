"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function VendorDashboardPage() {
  const [bookingId, setBookingId] = React.useState("");
  const [commission, setCommission] = React.useState("25");
  const [warranty, setWarranty] = React.useState("");
  const [accessories, setAccessories] = React.useState("");
  const [cancelReason, setCancelReason] = React.useState("");

  const [status, setStatus] = React.useState<
    { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string }
  >({ kind: "idle" });
  const [loading, setLoading] = React.useState(false);

  async function call(endpoint: string, body?: any) {
    setLoading(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Failed");
      setStatus({ kind: "ok", msg: "Success" });
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,242,254,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_80%,rgba(255,126,95,0.10),transparent_55%)]" />

      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Vendor dashboard — Accept / Close / Cancel
      </h1>
      <p className="mt-1 text-sm text-white/65">
        This is the foundational vendor flow UI. The server enforces status rules, cancellation
        reason word count, and minimum ₹25 commission.
      </p>

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
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              disabled={loading || !bookingId}
              onClick={() => call(`/api/vendor/bookings/${bookingId}/accept`)}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#00F2FE] px-5 text-sm font-medium text-[#0A192F] transition hover:bg-[#00F2FE]/90 disabled:opacity-60"
            >
              Accept
            </button>
            <button
              disabled={loading || !bookingId}
              onClick={() =>
                call(`/api/vendor/bookings/${bookingId}/close`, {
                  platformCommissionRupees: commission,
                  warrantyNotes: warranty || null,
                  accessoriesNotes: accessories || null,
                })
              }
              className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-white/15 px-5 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-60"
            >
              Close (Complete)
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-white/80">Platform commission (₹)</Label>
              <Input
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-white/80">Warranty notes</Label>
              <Input
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Accessories notes</Label>
            <Input
              value={accessories}
              onChange={(e) => setAccessories(e.target.value)}
              className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">
              Vendor cancellation reason (10–150 words)
            </Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-28 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
            <button
              disabled={loading || !bookingId}
              onClick={() =>
                call(`/api/vendor/bookings/${bookingId}/cancel`, {
                  reason: cancelReason,
                })
              }
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-rose-500/20 px-5 text-sm font-medium text-rose-100 transition hover:bg-rose-500/25 disabled:opacity-60"
            >
              Cancel booking
            </button>
          </div>

          <div className="text-sm">
            {status.kind === "ok" ? (
              <span className="text-emerald-300">{status.msg}</span>
            ) : status.kind === "err" ? (
              <span className="text-rose-300">{status.msg}</span>
            ) : (
              <span className="text-white/60">Ready</span>
            )}
          </div>
        </div>
      </Card>
    </main>
  );
}

