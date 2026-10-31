import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ROLE_LABEL, type Role } from "@/lib/auth/portals";

const COPY: Record<Role, { icon: typeof BarChart3; headline: string; points: string[] }> = {
  admin: {
    icon: BarChart3,
    headline: "Run the whole business from one console.",
    points: ["Revenue, collections and overdue at a glance", "Staff, permissions and customer assignment", "Every record, audited and secured"],
  },
  staff: {
    icon: CheckCircle2,
    headline: "Your customers, quotes and invoices in one place.",
    points: ["See only the customers assigned to you", "Track payments and chase overdue invoices", "Work to the permissions your admin set"],
  },
  customer: {
    icon: Sparkles,
    headline: "Your subscriptions, invoices and payments, simplified.",
    points: ["Know what renews and when", "See every invoice and payment you have made", "Request changes without sending an email"],
  },
};

/** Split-screen layout shared by every auth page. The accent colour comes from the portal theme. */
export function AuthShell({ portal, title, subtitle, children }: { portal: Role; title: string; subtitle?: string; children: ReactNode }) {
  const c = COPY[portal];
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-12 text-primary-foreground lg:flex lg:flex-col">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="absolute -bottom-32 -left-16 size-[28rem] rounded-full bg-black/10 blur-3xl" aria-hidden />
        <Link href="/" className="relative flex items-center gap-2.5 text-lg font-semibold">
          <Logo className="size-9 rounded-lg ring-2 ring-white/30" /> Brightloop
        </Link>
        <div className="relative mt-auto max-w-md">
          <span className="mb-5 inline-grid size-12 place-items-center rounded-xl bg-white/15 backdrop-blur"><c.icon className="size-6" /></span>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">{c.headline}</h2>
          <ul className="mt-6 space-y-3 text-primary-foreground/85">
            {c.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {p}</li>
            ))}
          </ul>
          <p className="mt-10 flex items-center gap-2 text-xs text-primary-foreground/70"><ShieldCheck className="size-4" /> Secured with row-level access control</p>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-gradient-to-b from-background to-card px-5 py-10">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="mb-8 flex items-center gap-2 font-semibold lg:hidden"><Logo /> Brightloop</Link>
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{ROLE_LABEL[portal]} portal</span>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">&larr; Back to brightloop</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
