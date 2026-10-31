"use client";

import { useRef, useState } from "react";
import { Download, FileJson, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import type { Customer } from "@/types";

const card = "rounded-2xl border bg-card p-5 shadow-[0_10px_30px_-24px_rgba(37,30,76,.36)] sm:p-6";
const esc = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
function csvRows(text: string) {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) { const char = text[i]; if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i++; } else if (char === '"') quoted = !quoted; else if (char === "," && !quoted) { row.push(cell); cell = ""; } else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && text[i + 1] === "\n") i++; row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; } else cell += char; }
  row.push(cell); if (row.some(Boolean)) rows.push(row); return rows;
}

export function ImportExportCenter() {
  const { data, setData } = useAppStore();
  const [preview, setPreview] = useState<Customer[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const download = (name: string, content: string, type: string) => { const url = URL.createObjectURL(new Blob([content], { type })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url); };
  const exportCsv = (key: "customers" | "subscriptions" | "invoices" | "payments") => {
    const rows = (data[key] as unknown as Record<string, unknown>[]).map((record) => Object.values(record));
    const headers = Object.keys((data[key][0] ?? {}) as object);
    download(`brightloop-${key}.csv`, [headers.map(esc).join(","), ...rows.map((row) => row.map(esc).join(","))].join("\r\n"), "text/csv;charset=utf-8");
    toast.success(`${key} CSV downloaded.`);
  };
  const loadFile = async (file?: File) => {
    if (!file) return;
    const rows = csvRows(await file.text()); const headers = (rows.shift() ?? []).map((x) => x.trim().toLowerCase());
    const column = (...names: string[]) => headers.findIndex((x) => names.includes(x));
    const nameIndex = column("name", "contact name", "customer name"); const companyIndex = column("company", "business", "organization"); const emailIndex = column("email", "email address"); const phoneIndex = column("phone", "telephone");
    if (nameIndex < 0 || emailIndex < 0) { setPreview([]); toast.error("CSV must include Name and Email columns."); return; }
    const imported = rows.map((row, index) => ({ id: `import-${Date.now()}-${index}`, name: (row[nameIndex] ?? "").trim(), company: companyIndex < 0 ? "" : (row[companyIndex] ?? "").trim(), email: (row[emailIndex] ?? "").trim().toLowerCase(), phone: phoneIndex < 0 ? undefined : row[phoneIndex]?.trim(), createdAt: new Date().toISOString().slice(0,10) })).filter((x) => x.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email) && !data.customers.some((existing) => existing.email.toLowerCase() === x.email)) as Customer[];
    setPreview(imported); if (!imported.length) toast.message("No valid new customer rows found.");
  };
  const confirmImport = () => { if (!preview.length) return; setData({ ...data, customers: [...preview, ...data.customers] }); toast.success(`${preview.length} customers imported into this browser.`); setPreview([]); if (input.current) input.current.value = ""; };
  return <div className="mx-auto max-w-5xl space-y-6"><header><span className="text-xs font-semibold uppercase tracking-wider text-primary">Data operations</span><h1 className="mt-2 text-2xl font-semibold tracking-tight">Import & export center</h1><p className="mt-1 text-sm text-muted-foreground">Move synthetic demo records in and out of this browser. Imports are previewed before they change workspace data.</p></header>
    <section className={card}><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><Download className="size-5"/></span><div><h2 className="font-semibold">Export demo records</h2><p className="mt-1 text-xs text-muted-foreground">Download a CSV for each record type or a complete JSON backup.</p></div></div><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{(["customers","subscriptions","invoices","payments"] as const).map((key)=><button key={key} onClick={()=>exportCsv(key)} className="flex items-center justify-between rounded-xl border bg-background px-3 py-3 text-left text-sm font-medium capitalize transition hover:border-primary/30 hover:bg-primary/5"><span className="flex items-center gap-2"><FileSpreadsheet className="size-4 text-primary"/>{key}</span><Download className="size-4 text-muted-foreground"/></button>)}</div><button onClick={()=>download("brightloop-demo-backup.json",JSON.stringify(data,null,2),"application/json")} className="mt-3 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"><FileJson className="size-4"/>Download full JSON backup</button></section>
    <section className={card}><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-700"><Upload className="size-5"/></span><div><h2 className="font-semibold">Import customers from CSV</h2><p className="mt-1 text-xs text-muted-foreground">Required columns: Name and Email. Optional columns: Company and Phone. Duplicate emails are skipped.</p></div></div><input ref={input} type="file" accept=".csv,text/csv" className="mt-5 block w-full rounded-xl border bg-background p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary" onChange={(e)=>void loadFile(e.target.files?.[0])}/>{preview.length>0&&<div className="mt-5 overflow-hidden rounded-xl border"><div className="flex items-center justify-between bg-muted/70 px-4 py-3"><span className="text-sm font-semibold">Import preview · {preview.length} valid new rows</span><button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground" onClick={confirmImport}>Import customers</button></div><div className="max-h-64 overflow-auto"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-background"><tr><th className="p-3">Name</th><th className="p-3">Company</th><th className="p-3">Email</th></tr></thead><tbody>{preview.slice(0,100).map((customer)=><tr key={customer.id} className="border-t"><td className="p-3">{customer.name}</td><td className="p-3">{customer.company}</td><td className="p-3">{customer.email}</td></tr>)}</tbody></table></div></div>}</section>
    <p className="text-xs text-muted-foreground">CSV imports create customer records only. All files and imported data stay in this browser demo; no production system is connected.</p>
  </div>;
}
