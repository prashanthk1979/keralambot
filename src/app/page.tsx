import { ArrowRight, ShieldCheck, Timer, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";

const services = [
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

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#00F2FE]/20 blur-3xl" />
        <div className="absolute -bottom-24 right-[-120px] h-[560px] w-[560px] rounded-full bg-[#FF7E5F]/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_20%_10%,rgba(255,255,255,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_50%,rgba(0,242,254,0.10),transparent_55%),radial-gradient(900px_circle_at_40%_90%,rgba(255,126,95,0.10),transparent_55%)]" />
      </div>

      <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-10 md:px-6 md:pt-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <Badge className="mb-4 border-white/10 bg-white/10 text-white/80">
              Built for all 14 districts of Kerala
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Kerala&apos;s Smarter Home Solution Platform
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-white/70 md:text-lg">
              Request a technician with <span className="text-white">zero booking fee</span>.
              We assign the right vendor based on your location and service type.
              Pay after the job is done.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <LinkButton
                href="/services"
                size="lg"
                className="h-11 rounded-2xl bg-[#00F2FE] px-5 text-[#0A192F] hover:bg-[#00F2FE]/90"
              >
                Book a service <ArrowRight className="ml-2 h-4 w-4" />
              </LinkButton>
              <LinkButton
                href="/vendor/signup"
                variant="outline"
                size="lg"
                className="h-11 rounded-2xl border-white/15 bg-white/5 px-5 text-white hover:bg-white/10"
              >
                Join as a Technician
              </LinkButton>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Card className="rounded-3xl border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-start gap-3">
                  <Wallet className="mt-0.5 h-5 w-5 text-[#00F2FE]" />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      No booking fee
                    </div>
                    <div className="text-xs text-white/65">
                      Request is always free.
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="rounded-3xl border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-start gap-3">
                  <Timer className="mt-0.5 h-5 w-5 text-[#FF7E5F]" />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Pay-after-job
                    </div>
                    <div className="text-xs text-white/65">
                      Transparent workflow.
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="rounded-3xl border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[#00F2FE]" />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Verified onboarding
                    </div>
                    <div className="text-xs text-white/65">
                      ID & license details.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="rounded-[28px] border-white/10 bg-white/10 p-6 backdrop-blur md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">
                  Live service coverage
                </div>
                <div className="text-xs text-white/65">
                  From Kasaragod to Thiruvananthapuram
                </div>
              </div>
              <Badge className="border-white/10 bg-white/10 text-white/80">
                28+ services
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {services.slice(0, 8).map((s) => (
                <div
                  key={s}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
                >
                  {s}
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#00F2FE]/15 via-white/5 to-[#FF7E5F]/15 px-4 py-3">
              <div className="text-sm text-white/80">
                Need something else? Explore all categories.
              </div>
              <LinkButton
                href="/services"
                variant="secondary"
                className="h-9 rounded-2xl bg-white/15 text-white hover:bg-white/20"
              >
                Browse
              </LinkButton>
            </div>
          </Card>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Popular categories
            </h2>
            <p className="mt-1 text-sm text-white/65">
              Appliances, plumbing, electrical, civil work and more.
            </p>
          </div>
          <LinkButton
            href="/services"
            variant="outline"
            className="hidden rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10 md:inline-flex"
          >
            Open booking portal <ArrowRight className="ml-2 h-4 w-4" />
          </LinkButton>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card
              key={s}
              className="group rounded-3xl border-white/10 bg-white/8 p-5 backdrop-blur transition hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">{s}</div>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70 ring-1 ring-white/10">
                  Request free
                </span>
              </div>
              <div className="mt-3 text-xs leading-6 text-white/60">
                Get an approximate price shown during booking. Admin can edit prices and
                assign the right vendor based on location.
              </div>
              <div className="mt-4">
                <LinkButton
                  href="/services"
                  size="sm"
                  className="rounded-2xl bg-[#00F2FE] text-[#0A192F] hover:bg-[#00F2FE]/90"
                >
                  Request
                </LinkButton>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
