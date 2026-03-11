"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  lat: string;
  lng: string;
  onChange: (next: { lat: string; lng: string }) => void;
  label?: string;
};

export function MapPinPicker({ lat, lng, onChange, label }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-white/80">{label ?? "Pin location"}</Label>
        <button
          type="button"
          className="text-xs font-medium text-[#00F2FE] hover:underline"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition((pos) => {
              onChange({
                lat: String(pos.coords.latitude),
                lng: String(pos.coords.longitude),
              });
            });
          }}
        >
          Use my current location
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
        <div className="h-44 w-full rounded-2xl border border-white/10 bg-[radial-gradient(650px_circle_at_20%_30%,rgba(0,242,254,0.14),transparent_55%),radial-gradient(650px_circle_at_80%_70%,rgba(255,126,95,0.14),transparent_55%)]" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-white/70">Latitude</Label>
            <Input
              value={lat}
              onChange={(e) => onChange({ lat: e.target.value, lng })}
              placeholder="e.g. 10.1632"
              className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">Longitude</Label>
            <Input
              value={lng}
              onChange={(e) => onChange({ lat, lng: e.target.value })}
              placeholder="e.g. 76.6413"
              className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-white/55">
          Map UI will be upgraded to Google Maps. Set{" "}
          <span className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span> in{" "}
          <span className="font-mono">.env.local</span>.
        </p>
      </div>
    </div>
  );
}

