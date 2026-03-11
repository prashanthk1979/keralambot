"use client";

import * as React from "react";

import { MapPinPicker } from "@/components/map-pin-picker";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LinkButton } from "@/components/link-button";

const serviceCategories = [
  "Refrigerator Repair",
  "Washing Machine Repair",
  "AC Repair & Installation",
  "Water Purifier Sales & Service",
  "TV Repair & Installation",
  "Microwave Repair",
  "Chimney Repair & Installation",
  "Pest Control",
  "Laptop/Desktop Sales, Service & Repairs",
  "Plumber (Pipes & Toiletries)",
  "Plumber (WM/Dishwasher & Pipe Solutions)",
  "Electrician",
  "House Painting & Waterproofing",
  "Cooking Range Repair",
  "Solar Water Heater Repair",
  "Gas Stove/Hob Repair & Installation",
  "CCTV Installation & Repairs",
  "Inverter/UPS Sales & Repair",
  "Water Level Controller",
  "Carpenter & Mosquito Mesh",
  "Modular Kitchen",
  "Geyser",
  "Dishwasher",
  "Civil Work / PoP / Welding / Fabrication / Core Cutting",
  "Gas Geyser",
  "Bike Repair",
  "Shingari Melam",
  "Coconut Tree Climbers",
] as const;

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function EmployeeOfficePage() {
  const minSlot = React.useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 150);
    return toDatetimeLocalValue(d);
  }, []);

  const [serviceName, setServiceName] = React.useState("");
  const [subCategoryText, setSubCategoryText] = React.useState("");
  const [scheduledFor, setScheduledFor] = React.useState(minSlot);

  const [customerName, setCustomerName] = React.useState("");
  const [customerMobile, setCustomerMobile] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [pin, setPin] = React.useState({ lat: "", lng: "" });

  const [status, setStatus] = React.useState<
    { kind: "idle" } | { kind: "ok"; id: string } | { kind: "err"; msg: string }
  >({ kind: "idle" });
  const [loading, setLoading] = React.useState(false);

  async function submit() {
    setLoading(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/employee/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceName,
          subCategoryText: subCategoryText || null,
          scheduledFor,
          customerName,
          customerMobile,
          customerEmail,
          customerAddress,
          notes: notes || null,
          lat: pin.lat,
          lng: pin.lng,
        }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Failed");
      setStatus({ kind: "ok", id: json.booking.id });
    } catch (e) {
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,242,254,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_80%,rgba(255,126,95,0.10),transparent_55%)]" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Employee CRM — Call booking
          </h1>
          <p className="mt-1 text-sm text-white/65">
            Create a booking on behalf of a customer. (Requires employee login)
          </p>
        </div>
        <LinkButton
          href="/admin/assign"
          variant="outline"
          className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          Admin assignment
        </LinkButton>
      </div>

      <Card className="mt-6 rounded-[28px] border-white/10 bg-white/10 p-6 backdrop-blur">
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white/80">Service needed</Label>
              <Select value={serviceName} onValueChange={(v) => setServiceName(v ?? "")}>
                <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Sub category (optional)</Label>
              <Input
                value={subCategoryText}
                onChange={(e) => setSubCategoryText(e.target.value)}
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white/80">Time of service requested</Label>
              <Input
                type="datetime-local"
                min={minSlot}
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          <MapPinPicker
            lat={pin.lat}
            lng={pin.lng}
            onChange={setPin}
            label="Customer location (pin)"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white/80">Customer name</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Customer mobile (+91)</Label>
              <Input
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white/80">Customer email (optional)</Label>
              <Input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Customer address</Label>
              <Input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {status.kind === "ok" ? (
                <span className="text-emerald-300">Created booking: {status.id}</span>
              ) : status.kind === "err" ? (
                <span className="text-rose-300">{status.msg}</span>
              ) : (
                <span className="text-white/60">Ready</span>
              )}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={submit}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#00F2FE] px-5 text-sm font-medium text-[#0A192F] transition hover:bg-[#00F2FE]/90 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Create booking"}
            </button>
          </div>
        </div>
      </Card>
    </main>
  );
}

