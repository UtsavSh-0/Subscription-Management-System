"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";

export function RegisterForm() {
  const { data, setData, addAccount, accounts } = useAppStore();
  const [notice, setNotice] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim().toLowerCase();
    const name = String(f.get("name")).trim();
    const password = String(f.get("password"));
    if (password !== String(f.get("confirm"))) return setNotice("Passwords do not match.");
    if (accounts.some(x => x.email.toLowerCase() === email) || data.customers.some(c => c.email.toLowerCase() === email)) return setNotice("This email already has an account.");
    const id = "cus-" + Date.now();
    setData({ ...data, customers: [{ id, name, company: String(f.get("company") || name), email, createdAt: new Date().toISOString().slice(0, 10) }, ...data.customers] });
    addAccount({ name, email, password, role: "customer", customerId: id });
    setNotice("Demo customer created. Sign in with your email and password.");
    e.currentTarget.reset();
  }
  return <form onSubmit={submit} className="space-y-4">
    <p className="rounded-md bg-warning/10 p-3 text-sm">Demo account only. Credentials are stored in this browser.</p>
    <Field label="Full name"><Input name="name" required minLength={2} /></Field>
    <Field label="Company"><Input name="company" /></Field>
    <Field label="Email"><Input name="email" type="email" required /></Field>
    <Field label="Password"><Input name="password" type="password" required minLength={8} /></Field>
    <Field label="Confirm password"><Input name="confirm" type="password" required minLength={8} /></Field>
    {notice && <p role="status" className="text-sm">{notice}</p>}
    <Button className="w-full">Create demo customer</Button>
    <p className="text-center text-sm"><Link href="/customer/login">Sign in</Link></p>
  </form>;
}
