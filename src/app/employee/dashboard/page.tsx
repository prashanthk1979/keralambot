"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";

type Earnings = {
  rupeesPerClosed: number;
  closedToday: number;
  closedYesterday: number;
  closedThisMonth: number;
  closedLastMonth: number;
  earnedToday: number;
  earnedYesterday: number;
  earnedThisMonth: number;
  earnedLastMonth: number;
  bookedTotal: number;
};

function StatCard(props: { title: string; value: string; sub?: string }) {
  return (
    <Card className="rounded-3xl border-white/10 bg-white/10 p-5 backdrop-blur">
      <div className="text-xs font-medium text-white/60">{props.title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {props.value}
      </div>
      {props.sub ? <div className="mt-1 text-xs text-white/55">{props.sub}</div> : null}
    </Card>
  );
}

export default function EmployeeDashboardPage() {
  const [data, setData] = React.useState<Earnings | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/employee/earnings");
      const json = (await res.json()) as any;
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Failed");
      setData(json as Earnings);
    } catch (e) {
      setData(null);
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(0,242,254,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_80%,rgba(255,126,95,0.10),transparent_55%)]" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Employee dashboard — Earnings
          </h1>
          <p className="mt-1 text-sm text-white/65">
            ₹40 per completed order booked by you.
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton
            href="/employee/officelogin"
            variant="outline"
            className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            Create call booking
          </LinkButton>
          <LinkButton
            href="/admin/requests"
            variant="outline"
            className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            Live Request Sheet
          </LinkButton>
        </div>
      </div>

      <Card className="mt-6 rounded-[28px] border-white/10 bg-white/10 p-6 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-white/70">
            {loading ? "Loading..." : err ? `Error: ${err}` : "Updated on refresh"}
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="EARNINGS TODAY"
            value={data ? `₹${data.earnedToday}` : "—"}
            sub={data ? `${data.closedToday} closed` : undefined}
          />
          <StatCard
            title="REQUESTS CLOSED YESTERDAY"
            value={data ? String(data.closedYesterday) : "—"}
            sub={data ? `₹${data.earnedYesterday} earned` : undefined}
          />
          <StatCard
            title="EARNED TILL DAY (THIS MONTH)"
            value={data ? `₹${data.earnedThisMonth}` : "—"}
            sub={data ? `${data.closedThisMonth} closed` : undefined}
          />
          <StatCard
            title="LAST MONTH EARNED"
            value={data ? `₹${data.earnedLastMonth}` : "—"}
            sub={data ? `${data.closedLastMonth} closed` : undefined}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <StatCard
            title="AGENTS BOOKED REQUEST (TOTAL)"
            value={data ? String(data.bookedTotal) : "—"}
            sub={data ? `₹${data.rupeesPerClosed} per completed order` : undefined}
          />
          <Card className="rounded-3xl border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="text-xs font-medium text-white/60">NOTES</div>
            <div className="mt-2 text-sm text-white/70">
              Earnings are counted when booking status is <span className="text-white">COMPLETED</span> and
              the booking was created by you (call booking flow).
            </div>
          </Card>
        </div>
      </Card>
    </main>
  );
}

