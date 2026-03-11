"use client";

import * as React from "react";
import Link from "next/link";

import { MapPinPicker } from "@/components/map-pin-picker";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const serviceOptions = [
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

export default function VendorSignupPage() {
  const [name, setName] = React.useState("");
  const [primaryMobile, setPrimaryMobile] = React.useState("");
  const [altMobiles, setAltMobiles] = React.useState("");
  const [address, setAddress] = React.useState("");

  const [aadhaar, setAadhaar] = React.useState("");
  const [pan, setPan] = React.useState("");
  const [municipalLicenseId, setMunicipalLicenseId] = React.useState("");

  const [shopPin, setShopPin] = React.useState({ lat: "", lng: "" });
  const [serviceRadiusKm, setServiceRadiusKm] = React.useState("10");

  const [selectedServices, setSelectedServices] = React.useState<Set<string>>(
    () => new Set()
  );

  const [submitState, setSubmitState] = React.useState<
    { kind: "idle" } | { kind: "ok"; id: string } | { kind: "err"; msg: string }
  >({ kind: "idle" });
  const [submitting, setSubmitting] = React.useState(false);

  const toggleService = (s: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  async function submit() {
    setSubmitting(true);
    setSubmitState({ kind: "idle" });
    try {
      const alt = altMobiles
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/vendor/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          primaryMobile,
          altMobiles: alt.length ? alt : null,
          address,
          aadhaar: aadhaar || null,
          pan: pan || null,
          municipalLicenseId: municipalLicenseId || null,
          shopLat: shopPin.lat,
          shopLng: shopPin.lng,
          serviceRadiusKm,
          servicesOffered: Array.from(selectedServices),
        }),
      });
      const json = (await res.json()) as any;
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Failed");
      setSubmitState({ kind: "ok", id: json.vendorProfileId });
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
          Technician / Vendor registration
        </h1>
        <p className="text-sm text-white/65">
          Use this form to create a vendor profile. After approval, vendors can
          receive and accept jobs based on location and service radius.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[28px] border-white/10 bg-white/10 p-6 backdrop-blur">
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/80">Technician name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Primary contact number</Label>
                <Input
                  value={primaryMobile}
                  onChange={(e) => setPrimaryMobile(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  inputMode="tel"
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/80">
                  Alternate contact numbers
                </Label>
                <Input
                  value={altMobiles}
                  onChange={(e) => setAltMobiles(e.target.value)}
                  placeholder="Comma-separated, e.g. +91..., +91..."
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Serviceable range (KM)</Label>
                <Input
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 10"
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Technician address</Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop/House name, street, landmark, district"
                className="min-h-24 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-white/80">AADHAAR</Label>
                <Input
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">PAN</Label>
                <Input
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  placeholder="ABCDE1234F"
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">
                  Shop municipal license ID
                </Label>
                <Input
                  value={municipalLicenseId}
                  onChange={(e) => setMunicipalLicenseId(e.target.value)}
                  placeholder="License ID"
                  className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <MapPinPicker
              lat={shopPin.lat}
              lng={shopPin.lng}
              onChange={setShopPin}
              label="Pin point map to technician’s shop location"
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-white/80">Services offered</Label>
                <div className="text-xs text-white/55">
                  Selected: {selectedServices.size}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {serviceOptions.map((s) => {
                  const checked = selectedServices.has(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={[
                        "flex items-start gap-3 rounded-2xl border px-3 py-2 text-left text-sm transition",
                        checked
                          ? "border-white/20 bg-white/12 text-white"
                          : "border-white/10 bg-white/5 text-white/75 hover:bg-white/8 hover:text-white",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-md ring-1 ring-white/15",
                          checked ? "bg-[#00F2FE]" : "bg-white/10",
                        ].join(" ")}
                      />
                      <span className="leading-5">{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/55">
                {submitState.kind === "ok"
                  ? `Submitted. Vendor Profile ID: ${submitState.id}`
                  : submitState.kind === "err"
                    ? submitState.msg
                    : "Submitting will create a vendor onboarding request."}
              </p>
              <Button
                disabled={submitting}
                onClick={submit}
                className="h-11 rounded-2xl bg-[#00F2FE] px-5 text-[#0A192F] hover:bg-[#00F2FE]/90"
              >
                {submitting ? "Submitting..." : "Submit registration"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="rounded-[28px] border-white/10 bg-white/10 p-6 backdrop-blur">
          <div className="text-sm font-semibold text-white">
            Vendor login policy (planned)
          </div>
          <p className="mt-2 text-sm text-white/70">
            Vendors will authenticate using <span className="font-mono">@v.keralambot.com</span>.
            Employees use <span className="font-mono">@e.keralambot.com</span>. Admin is{" "}
            <span className="font-mono">prashanthk1979@gmail.com</span>.
          </p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">Already onboarded?</div>
            <p className="mt-1 text-sm text-white/70">
              Go to the shared login gateway.
            </p>
            <Link
              href="/auth/login"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "mt-3 h-11 w-full rounded-2xl bg-white/15 text-white hover:bg-white/20"
              )}
            >
              Login
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

