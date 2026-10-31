import Link from "next/link";
import {
  ArrowRight, BarChart3, BellRing, CheckCircle2, CreditCard, FileText, Layers, LifeBuoy, LockKeyhole, Mail, Menu,
  Receipt, Repeat, ShieldCheck, Sparkles, UserCog, Users, Workflow, Zap,
} from "lucide-react";
import { ContactForm } from "@/components/landing/contact-form";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { seedData } from "@/data/seed";
import { REF_DATE } from "@/lib/config";
import { formatMoney } from "@/lib/utils";

const NAV = [["Home", "/"], ["Features", "#features"], ["About", "#about"], ["Contact", "#contact"]] as const;

const FEATURES = [
  { icon: Repeat, title: "Recurring billing", text: "Demo daily, weekly, monthly and yearly billing with duplicate invoice prevention." },
  { icon: FileText, title: "Quotations to subscriptions", text: "Prepare a quote, accept it in the customer portal, and create a subscription and invoice." },
  { icon: Receipt, title: "Invoices and payments", text: "Invoices stay in step with payments automatically, and overdue ones surface on their own." },
  { icon: Users, title: "Three role-based portals", text: "Separate Admin, Staff and Customer demo experiences backed by browser-local sample data." },
  { icon: BarChart3, title: "Live demo analytics", text: "Revenue, collections, subscription status and overdue exposure update with demo activity." },
  { icon: LifeBuoy, title: "Local contact form", text: "Try the public contact form; messages are saved in this browser for the demo." },
];

const ROLES = [
  { icon: ShieldCheck, name: "Admin Portal", text: "Manage products, customers, quotations, billing and demo settings.", href: "/admin/login", cta: "Admin Login", tone: "from-teal-700 to-emerald-600" },
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

const activeSeedSubscriptions = seedData.subscriptions.filter((subscription) => subscription.status === "active");
const collectedSeedRevenue = seedData.payments.reduce((total, payment) => total + payment.amount, 0);
const renewalsThisWeek = seedData.subscriptions.filter((subscription) => {
  const days = (new Date(`${subscription.expiryDate}T00:00:00Z`).getTime() - new Date(`${REF_DATE}T00:00:00Z`).getTime()) / 86_400_000;
  return subscription.status === "active" && days >= 0 && days <= 7;
}).length;

export const dynamic = "force-dynamic";

function Hero() {
  return (
    <div className="relative mx-auto mt-14 w-full max-w-xl lg:mt-0" aria-hidden>
      <div className="absolute -inset-4 rounded-[2rem] bg-orange-500/15 blur-3xl" />
      <div className="relative animate-float overflow-hidden rounded-2xl border border-white/10 bg-[#111113] p-4 text-white shadow-[0_30px_100px_-35px_rgba(249,115,22,.35)] sm:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3 text-left">
          <Logo className="size-7 rounded-lg" /><span className="text-xs font-semibold tracking-wide">BRIGHTLOOP</span>
          <span className="ml-5 hidden text-[11px] text-white/45 sm:inline">Overview&nbsp;&nbsp;&nbsp; Customers&nbsp;&nbsp;&nbsp; Subscriptions&nbsp;&nbsp;&nbsp; Billing</span>
          <span className="ml-auto size-7 rounded-full bg-orange-300/80" aria-label="Demo account" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-red-400" /><span className="size-2.5 rounded-full bg-amber-400" /><span className="size-2.5 rounded-full bg-emerald-400" /></div>
          <span className="rounded-full bg-orange-400/10 px-2.5 py-0.5 text-[11px] font-medium text-orange-300">Revenue overview</span>
        </div>
        <svg viewBox="0 0 400 170" className="mt-4 w-full">
          <defs>
            <linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f97316" stopOpacity=".32" /><stop offset="1" stopColor="#f97316" stopOpacity="0" /></linearGradient>
          </defs>
          {[30, 70, 110, 150].map((y) => (<line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#ffffff" strokeOpacity=".09" strokeDasharray="4 6" />))}
          {[20, 80, 140, 200, 260, 320].map((x, i) => (<rect key={x} x={x} y={150 - [40, 62, 55, 84, 96, 120][i]} width="34" height={[40, 62, 55, 84, 96, 120][i]} rx="6" fill="#f97316" opacity={i === 5 ? ".95" : ".18"} />))}
          <path d="M10 130 C60 110 90 120 130 90 S210 70 250 55 S330 30 390 18 L390 150 L10 150Z" fill="url(#area)" />
          <path d="M10 130 C60 110 90 120 130 90 S210 70 250 55 S330 30 390 18" fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" />
          <circle cx="390" cy="18" r="5" fill="#fb923c" />
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[["Active", "bg-emerald-500"], ["Renewing", "bg-sky-500"], ["Overdue", "bg-rose-500"]].map(([l, c]) => (
            <div key={l} className="rounded-lg border border-white/10 bg-white/[.035] p-3 text-left"><span className={`mb-2 block h-1.5 w-8 rounded-full ${c}`} /><span className="text-[11px] text-white/55">{l}</span><span className="mt-1 block h-3 w-12 rounded bg-white/10" /></div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
          {[["Active subscriptions", String(activeSeedSubscriptions.length)], ["Collected in sample", formatMoney(collectedSeedRevenue)], ["Customer accounts", String(seedData.customers.length)], ["Renewals this week", String(renewalsThisWeek)]].map(([label, value]) => <div key={label} className="rounded-lg border border-white/10 bg-white/[.035] px-3 py-2.5"><p className="text-[10px] text-white/45">{label}</p><p className="mt-1 text-base font-semibold tracking-tight sm:text-lg">{value}</p></div>)}
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
  const demosEnabled = true;
  return (
    <div id="home" className="min-h-screen scroll-smooth bg-background">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0c]/95 text-white backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight"><Logo /> Brightloop</Link>
          <nav aria-label="Main" className="ml-4 hidden items-center gap-6 text-sm text-white/65 lg:flex">
            {NAV.map(([l, h]) => (<Link key={l} href={h} className="hover:text-white">{l}</Link>))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Button asChild variant="ghost" size="sm"><Link href="/admin/login">Admin Login</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link href="/staff/login">Staff Login</Link></Button>
            <Button asChild variant="outline" size="sm"><Link href="/customer/login">Customer Login</Link></Button>
            <Button asChild size="sm"><Link href="/customer/register">Sign Up</Link></Button>
          </div>
          <details className="group relative ml-auto lg:hidden">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-md border border-white/20 bg-white/5" aria-label="Open menu"><Menu className="size-5" /></summary>
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
        <section className="public-hero relative overflow-hidden">
          <div className="bg-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-5 pb-14 pt-16 text-center sm:pb-20 sm:pt-20">
            <div className="animate-rise max-w-4xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-orange-200"><Sparkles className="size-3.5" /> Subscription management, in one clear view</span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Keep every subscription <span className="text-brand-gradient">moving forward.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base text-white/65 sm:text-lg">
                See renewals, customer relationships and recurring revenue in one focused workspace. Explore Brightloop’s admin, staff and customer portals with a complete local demo.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg"><Link href="/admin/login">Explore the demo <ArrowRight /></Link></Button>
                <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10"><Link href="#features">See how it works</Link></Button>
              </div>
              <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/55">
                {["Three connected role experiences", "A working subscription lifecycle", "Resettable sample data"].map((t) => (<li key={t} className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-orange-400" /> {t}</li>))}
              </ul>
            </div>
            <div className="mt-14 w-full max-w-6xl"><Hero /></div>
          </div>
        </section>

        <section aria-labelledby="portals" className="relative border-y bg-card/60 py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mx-auto max-w-2xl text-center"><h2 id="portals" className="text-3xl font-semibold tracking-tight">Choose your portal</h2><p className="mt-2 text-muted-foreground">Three separate demo experiences with sample records.</p></div>
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
            <div className="mx-auto max-w-2xl text-center"><h2 id="try-demo" className="text-3xl font-semibold tracking-tight">Try Demo</h2><p className="mt-2 text-muted-foreground">Use role-specific credentials to explore realistic records stored in this browser.</p></div>
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
                {["Separate portal sign-in routes", "Demo role views are scoped in the interface", "Invoice totals update with demo payments", "Customers can request renewals, changes and cancellations"].map((t) => (<li key={t} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{t}</li>))}
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
              <p className="mt-4 text-muted-foreground">Questions about the demo? Send a note and it will be saved in this browser.</p>
              <p className="mt-6 flex items-center gap-2 text-sm"><Mail className="size-4 text-primary" /> Prefer your portal? <Link href="/customer/login" className="font-medium text-primary hover:underline">Customers can review billing and request subscription changes.</Link></p>
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
