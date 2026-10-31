import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export function LegalPage({ title, sections }: { title: string; sections: [string, string][] }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-card/80 backdrop-blur"><div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5"><Link href="/" className="flex items-center gap-2 font-semibold"><Logo /> Brightloop</Link><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">&larr; Home</Link></div></header>
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-8 space-y-6">
          {sections.map(([h, t], i) => (<section key={h} className="rounded-xl border bg-card p-5 shadow-card"><h2 className="font-semibold">{i + 1}. {h}</h2><p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t}</p></section>))}
        </div>
      </main>
    </div>
  );
}
