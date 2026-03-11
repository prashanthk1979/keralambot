import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";

export default function LoginPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,242,254,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_80%,rgba(255,126,95,0.10),transparent_55%)]" />

      <Card className="rounded-[28px] border-white/10 bg-white/10 p-6 backdrop-blur md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Login
        </h1>
        <p className="mt-2 text-sm text-white/70">
          This is the shared login gateway. Supabase Auth wiring (phone/email + domain-based
          role routing) will be connected next.
        </p>

        <div className="mt-6 grid gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">Customers</div>
            <div className="mt-1 text-sm text-white/70">
              Login via Phone (strictly +91) or Email.
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">Vendors</div>
            <div className="mt-1 text-sm text-white/70">
              Login via <span className="font-mono">@v.keralambot.com</span>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">Employees</div>
            <div className="mt-1 text-sm text-white/70">
              Login via <span className="font-mono">@e.keralambot.com</span>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">Admin</div>
            <div className="mt-1 text-sm text-white/70">
              <span className="font-mono">prashanthk1979@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LinkButton
            href="/services"
            size="lg"
            className="h-11 rounded-2xl bg-[#00F2FE] px-5 text-[#0A192F] hover:bg-[#00F2FE]/90"
          >
            Continue to booking
          </LinkButton>
          <LinkButton
            href="/vendor/signup"
            variant="outline"
            size="lg"
            className="h-11 rounded-2xl border-white/15 bg-white/5 px-5 text-white hover:bg-white/10"
          >
            Technician signup
          </LinkButton>
        </div>
      </Card>
    </main>
  );
}

