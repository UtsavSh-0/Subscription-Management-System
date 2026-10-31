import Link from "next/link";
import {
  ArrowRight, BarChart3, BellRing, CheckCircle2, CreditCard, FileText, Layers, LifeBuoy, LockKeyhole, Mail, Menu,
  Receipt, Repeat, ShieldCheck, Sparkles, UserCog, Users, Workflow, Zap,
} from "lucide-react";
import { ContactForm } from "@/components/landing/contact-form";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { demoConfig } from "@/lib/env";

const NAV = [["Home", "/"], ["Features", "#features"], ["About", "#about"], ["Contact", "#contact"]] as const;

const FEATURES = [
  { icon: Repeat, title: "Recurring billing", text: "Daily, weekly, monthly and yearly plans with one invoice per period, enforced by the database." },
  { icon: FileText, title: "Quotations to subscriptions", text: "Quote a customer, confirm it, and convert it into a live subscription without re-entering anything." },
  { icon: Receipt, title: "Invoices and payments", text: "Invoices stay in step with payments automatically, and overdue ones surface on their own." },
  { icon: Users, title: "Role-based portals", text: "Separate Admin, Staff and Customer experiences on one shared, secure data model." },
  { icon: BarChart3, title: "Live analytics", text: "Revenue, collections, subscription status and overdue exposure from your real records." },
  { icon: LifeBuoy, title: "Support desk", text: "Customers raise requests and your team responds, all tied to the right account." },
];

const ROLES = [
  { icon: ShieldCheck, name: "Admin Portal", text: "Complete business and system management.", href: "/admin/login", cta: "Admin Login", tone: "from-teal-700 to-emerald-600" },
  { icon: UserCog, name: "Staff Portal", text: "Manage customers, subscriptions, quotations and invoices.", href: "/staff/login", cta: "Staff Login", tone: "from-indigo-700 to-blue-600" },
  { icon: Users, name: "Customer Portal", text: "Manage subscriptions, invoices and payments.", href: "/customer/login", cta: "Customer Login", tone: "from-violet-700 to-fuchsia-600", extra: { href: "/customer/register", label: "Create Account" } },
];

const STEPS = [
  { icon: Layers, title: "Set up your catalog", text: "Products, plans, taxes and discounts." },
  { icon: FileText, title: "Quote and subscribe", text: "Send a quotation, confirm it, activate the subscription." },
  { icon: Zap, title: "Bill automatically", text: "An invoice is raised each period, once and only once." },
  { icon: CreditCard, title: "Collect and track", text: "Record payments, watch overdue, keep customers informed." },
];

const BENEFITS = [
  { icon: Workflow, title: "Less manual work", text: "Renewals, invoices and statuses follow the subscription instead of a spreadsheet." },
  { icon: BellRing, title: "Fewer missed payments", text: "Overdue invoices are visible to staff and customers the moment they happen." },
  { icon: LockKeyhole, title: "Data stays separated", text: "Customers see only their records; staff see only the customers assigned to them." },
];

export const dynamic = "force-dynamic";

function Hero() {
  return (
    <div className="relative mx-auto mt-14 w-full max-w-xl lg:mt-0" aria-hidden>
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-teal-400/30 via-sky-300/20 to-violet-400/30 blur-2xl" />
      <div className="relative animate-float rounded-2xl border bg-card p-5 shadow-pop">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-red-400" /><span className="size-2.5 rounded-full bg-amber-400" /><span className="size-2.5 rounded-full bg-emerald-400" /></div>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">Revenue overview</span>
        </div>
        <svg viewBox="0 0 400 170" className="mt-4 w-full">
          <defs>
            <linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0f766e" stopOpacity=".35" /><stop offset="1" stopColor="#0f766e" stopOpacity="0" /></linearGradient>
          </defs>
          {[30, 70, 110, 150].map((y) => (<line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#e2e8e5" strokeDasharray="4 6" />))}
          {[20, 80, 140, 200, 260, 320].map((x, i) => (<rect key={x} x={x} y={150 - [40, 62, 55, 84, 96, 120][i]} width="34" height={[40, 62, 55, 84, 96, 120][i]} rx="6" fill="#99d5c9" opacity=".7" />))}
          <path d="M10 130 C60 110 90 120 130 90 S210 70 250 55 S330 30 390 18 L390 150 L10 150Z" fill="url(#area)" />
          <path d="M10 130 C60 110 90 120 130 90 S210 70 250 55 S330 30 390 18" fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
          <circle cx="390" cy="18" r="5" fill="#0f766e" />
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[["Active", "bg-emerald-500"], ["Renewing", "bg-sky-500"], ["Overdue", "bg-rose-500"]].map(([l, c]) => (
            <div key={l} className="rounded-lg border bg-background p-3"><span className={`mb-2 block h-1.5 w-8 rounded-full ${c}`} /><span className="text-[11px] text-muted-foreground">{l}</span><span className="mt-1 block h-3 w-12 rounded bg-muted" /></div>
          ))}
        </div>
      </div>
      <div className="absolute -left-4 top-24 hidden animate-float rounded-xl border bg-card p-3 shadow-pop sm:flex sm:items-center sm:gap-2.5 [animation-delay:1.5s]">
        <span className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><CheckCircle2 className="size-5" /></span>
        <span className="text-xs"><b className="block text-sm">Payment received</b>Invoice marked paid</span>
      </div>
      <div className="absolute -right-3 -bottom-5 hidden animate-float rounded-xl border bg-card p-3 shadow-pop sm:flex sm:items-center sm:gap-2.5 [animation-delay:3s]">
        <span className="grid size-9 place-items-center rounded-lg bg-violet-100 text-violet-700"><Repeat className="size-5" /></span>
        <span className="text-xs"><b className="block text-sm">Renewal billed</b>One invoice per period</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const demosEnabled = !!demoConfig();
  return (
    <div id="home" className="min-h-screen scroll-smooth bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight"><Logo /> Brightloop</Link>
          <nav aria-label="Main" className="ml-4 hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
            {NAV.map(([l, h]) => (<Link key={l} href={h} className="hover:text-foreground">{l}</Link>))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Button asChild variant="ghost" size="sm"><Link href="/admin/login">Admin Login</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link href="/staff/login">Staff Login</Link></Button>
            <Button asChild variant="outline" size="sm"><Link href="/customer/login">Customer Login</Link></Button>
            <Button asChild size="sm"><Link href="/customer/register">Sign Up</Link></Button>
          </div>
          <details className="group relative ml-auto lg:hidden">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-md border bg-card" aria-label="Open menu"><Menu className="size-5" /></summary>
            <div className="absolute right-0 top-12 w-60 space-y-1 rounded-xl border bg-card p-2 shadow-pop">
              {NAV.map(([l, h]) => (<Link key={l} href={h} className="block rounded-md px-3 py-2 text-sm hover:bg-muted">{l}</Link>))}
              <div className="my-1 border-t" />
              <Link href="/admin/login" className="block rounded-md px-3 py-2 text-sm hover:bg-muted">Admin Login</Link>
              <Link href="/staff/login" className="block rounded-md px-3 py-2 text-sm hover:bg-muted">Staff Login</Link>
              <Link href="/customer/login" className="block rounded-md px-3 py-2 text-sm hover:bg-muted">Customer Login</Link>
              <Link href="/customer/register" className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">Sign Up</Link>
            </div>
          </details>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
          <div className="absolute -left-40 -top-40 size-[34rem] rounded-full bg-teal-300/30 blur-3xl" aria-hidden />
          <div className="absolute -right-40 top-20 size-[30rem] rounded-full bg-violet-300/25 blur-3xl" aria-hidden />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-2">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-primary shadow-card"><Sparkles className="size-3.5" /> Subscription management platform</span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Manage Every Subscription. <span className="text-brand-gradient">Simplify Every Operation.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Brightloop brings plans, quotations, recurring invoices and payments into one platform, with a dedicated portal for your admins, your staff and your customers.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg"><Link href="/customer/register">Get Started <ArrowRight /></Link></Button>
                <Button asChild size="lg" variant="outline"><Link href="#features">Explore Features</Link></Button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["Role-based access", "One invoice per period", "Customer data isolation"].map((t) => (<li key={t} className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> {t}</li>))}
              </ul>
            </div>
            <Hero />
          </div>
        </section>

        <section aria-labelledby="portals" className="relative border-y bg-card/60 py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mx-auto max-w-2xl text-center"><h2 id="portals" className="text-3xl font-semibold tracking-tight">Choose your portal</h2><p className="mt-2 text-muted-foreground">Three separate experiences, one secure platform.</p></div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {ROLES.map((r) => (
                <div key={r.name} className="group overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-pop">
                  <div className={`relative bg-gradient-to-br ${r.tone} p-6 text-white`}>
                    <r.icon className="absolute -right-3 -top-3 size-28 text-white/10" aria-hidden />
                    <span className="grid size-11 place-items-center rounded-xl bg-white/20 backdrop-blur"><r.icon className="size-6" /></span>
                    <h3 className="mt-4 text-xl font-semibold">{r.name}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground">{r.text}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button asChild><Link href={r.href}>{r.cta}</Link></Button>
                      {r.extra && <Button asChild variant="outline"><Link href={r.extra.href}>{r.extra.label}</Link></Button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {demosEnabled && <section aria-labelledby="try-demo" className="border-b py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mx-auto max-w-2xl text-center"><h2 id="try-demo" className="text-3xl font-semibold tracking-tight">Try Demo</h2><p className="mt-2 text-muted-foreground">Explore Brightloop with isolated sample accounts and realistic sample data.</p></div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild><Link href="/admin/login">Explore Admin Demo</Link></Button>
              <Button asChild variant="outline"><Link href="/staff/login">Explore Staff Demo</Link></Button>
              <Button asChild variant="outline"><Link href="/customer/login">Explore Customer Demo</Link></Button>
            </div>
          </div>
        </section>}

        <section id="features" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-medium text-primary">Key features</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Everything recurring revenue needs</h2></div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl border bg-gradient-to-br from-card to-primary/5 p-6 shadow-card transition hover:shadow-pop">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><f.icon className="size-5" /></span>
                  <h3 className="mt-4 font-semibold">{f.title}</h3><p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-gradient py-20 text-white">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-medium text-white/75">How Brightloop works</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">From first quote to final payment</h2></div>
            <ol className="mt-12 grid gap-5 md:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative rounded-2xl bg-white/10 p-6 backdrop-blur ring-1 ring-white/20">
                  <span className="absolute right-4 top-3 text-5xl font-bold text-white/10">{i + 1}</span>
                  <s.icon className="size-7" /><h3 className="mt-4 font-semibold">{s.title}</h3><p className="mt-1 text-sm text-white/80">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="about" className="scroll-mt-20 py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-primary">Why choose Brightloop</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built for the way subscription businesses actually run</h2>
              <p className="mt-4 text-muted-foreground">Brightloop gives every person the view they need and nothing more. Admins run the business, staff handle their assigned customers, and customers manage their own subscriptions, all against the same trusted records.</p>
              <ul className="mt-6 space-y-3 text-sm">
                {["Separate portals with their own sign-in", "Access enforced in the database, not just the interface", "Invoices and payments always agree with each other", "Customers can request renewals, changes and cancellations themselves"].map((t) => (<li key={t} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{t}</li>))}
              </ul>
            </div>
            <div className="grid gap-4">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-card">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-teal-500 text-white"><b.icon className="size-5" /></span>
                  <div><h3 className="font-semibold">{b.title}</h3><p className="mt-1 text-sm text-muted-foreground">{b.text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 border-t bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-primary">Contact</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Talk to the Brightloop team</h2>
              <p className="mt-4 text-muted-foreground">Questions about plans, onboarding or your account? Send a note and we will reply by email.</p>
              <p className="mt-6 flex items-center gap-2 text-sm"><Mail className="size-4 text-primary" /> Prefer your portal? <Link href="/customer/login" className="font-medium text-primary hover:underline">Customers can raise a support request after signing in.</Link></p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div><Link href="/" className="flex items-center gap-2 font-semibold"><Logo /> Brightloop</Link><p className="mt-3 text-sm text-muted-foreground">Manage every subscription. Simplify every operation.</p></div>
          <div><h4 className="text-sm font-semibold">Product</h4><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li><Link href="#features" className="hover:text-foreground">Features</Link></li><li><Link href="#about" className="hover:text-foreground">About</Link></li><li><Link href="#contact" className="hover:text-foreground">Contact</Link></li></ul></div>
          <div><h4 className="text-sm font-semibold">Portals</h4><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li><Link href="/admin/login" className="hover:text-foreground">Admin Login</Link></li><li><Link href="/staff/login" className="hover:text-foreground">Staff Login</Link></li><li><Link href="/customer/login" className="hover:text-foreground">Customer Login</Link></li><li><Link href="/customer/register" className="hover:text-foreground">Create Account</Link></li></ul></div>
          <div><h4 className="text-sm font-semibold">Legal</h4><ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li><Link href="/terms" className="hover:text-foreground">Terms and conditions</Link></li><li><Link href="/privacy" className="hover:text-foreground">Privacy policy</Link></li></ul></div>
        </div>
        <div className="border-t py-5 text-center text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Brightloop. All rights reserved.</div>
      </footer>
    </div>
  );
}
