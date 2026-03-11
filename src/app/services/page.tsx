"use client";

import * as React from "react";
import Link from "next/link";

import { MapPinPicker } from "@/components/map-pin-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function ServicesPage() {
  const minSlot = React.useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 150); // 2.5 hours
    return toDatetimeLocalValue(d);
  }, []);

  const [service, setService] = React.useState<string>("");
  const [subCategory, setSubCategory] = React.useState("");
  const [scheduledFor, setScheduledFor] = React.useState(minSlot);
  const [customerName, setCustomerName] = React.useState("");
  const [customerMobile, setCustomerMobile] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [pin, setPin] = React.useState({ lat: "", lng: "" });

  const [submitState, setSubmitState] = React.useState<
    { kind: "idle" } | { kind: "ok"; id: string } | { kind: "err"; msg: string }
  >({ kind: "idle" });
  const [submitting, setSubmitting] = React.useState(false);

  async function submitBooking() {
    setSubmitting(true);
    setSubmitState({ kind: "idle" });
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceName: service,
          subCategoryText: subCategory || null,
          scheduledFor,
          customerName,
          customerMobile,
          customerEmail,
          customerAddress: address,
          notes: notes || null,
          lat: pin.lat,
          lng: pin.lng,
        }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Failed");
      setSubmitState({ kind: "ok", id: json.booking.id });
    } catch (e) {
      setSubmitState({
        kind: "err",
        msg: e instanceof Error ? e.message : "Failed",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,242,254,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_80%,rgba(255,126,95,0.10),transparent_55%)]" />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Customer booking form
        </h1>
        <p className="text-sm text-white/65">
          Booking request is <span className="text-white">free</span>. We will assign a vendor based on your location.
          You cannot select a slot within the next <span className="text-white">2.5 hours</span>.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] border-white/10 bg-white/10 p-6 backdrop-blur">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/80">Service needed</Label>
                <Select
                  value={service}
                  onValueChange={(v) => setService(v ?? "")}
                >
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
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="e.g. Installation / Gas refill / Noise issue"
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
                <p className="text-xs text-white/55">
                  Minimum selectable time is enforced client-side. Server validation will also be added.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Approx price (shown)</Label>
                <Input
                  value={"Admin-editable"}
                  disabled
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white/70"
                />
                <p className="text-xs text-white/55">
                  Price shown during booking is configurable in the admin panel (to be built).
                </p>
              </div>
            </div>

            <MapPinPicker
              lat={pin.lat}
              lng={pin.lng}
              onChange={setPin}
              label="Customer Google Map location"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/80">Customer name</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">
                  Customer mobile number (+91)
                </Label>
                <Input
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  inputMode="tel"
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
                  placeholder="name@email.com"
                  inputMode="email"
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Customer address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House name, street, landmark, district"
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Comment / Notes for service</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the technician should know..."
                className="min-h-28 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/55">
                {submitState.kind === "ok"
                  ? `Request created: ${submitState.id}`
                  : submitState.kind === "err"
                    ? submitState.msg
                    : "Submitting will create a booking request."}
              </p>
              <Button
                disabled={submitting}
                onClick={submitBooking}
                className="h-11 rounded-2xl bg-[#00F2FE] px-5 text-[#0A192F] hover:bg-[#00F2FE]/90"
              >
                {submitting ? "Submitting..." : "Submit booking request"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-white/10 p-6 backdrop-blur">
          <div className="text-sm font-semibold text-white">What happens next?</div>
          <div className="mt-2 space-y-2 text-sm text-white/70">
            <div>1) Your request is logged with location + preferred time.</div>
            <div>2) Our internal agent assigns a vendor based on district & range.</div>
            <div>3) Vendor accepts the job. Chat unlocks only after ACCEPTED.</div>
            <div>4) Pay after completion. Warranty/accessories handled on closure.</div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">Are you a technician?</div>
            <p className="mt-1 text-sm text-white/70">
              Create a vendor profile and set your service radius.
            </p>
            <Link
              href="/vendor/signup"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "mt-3 h-11 w-full rounded-2xl bg-white/15 text-white hover:bg-white/20"
              )}
            >
              Technician Signup
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

