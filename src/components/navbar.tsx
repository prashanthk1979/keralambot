"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const navItems = [
  { href: "/services", label: "Services" },
  { href: "/vendor/signup", label: "Technician Signup" },
  { href: "/auth/login", label: "Login" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A192F]/60 backdrop-blur supports-[backdrop-filter]:bg-[#0A192F]/45">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="group inline-flex items-center gap-2">
            <span className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#00F2FE]/30 via-white/10 to-[#FF7E5F]/30 ring-1 ring-white/15" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-white">
                KeralamBot
              </div>
              <div className="text-xs text-white/60">
                Kerala&apos;s Smarter Home Services
              </div>
            </div>
          </Link>
          <Badge className="hidden border-white/10 bg-white/10 text-white/80 md:inline-flex">
            Pay-After-Job
          </Badge>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/services"
            className={cn(
              buttonVariants(),
              "h-9 rounded-2xl bg-[#00F2FE] px-4 text-[#0A192F] hover:bg-[#00F2FE]/90"
            )}
          >
            Request a booking
          </Link>
        </div>
      </div>
    </header>
  );
}

