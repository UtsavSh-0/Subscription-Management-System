import { createClient } from "@supabase/supabase-js";

const required = (key) => {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
  return process.env[key];
};
const db = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false, autoRefreshToken: false } });
const check = (r) => { if (r.error) throw r.error; return r.data; };
const emails = new Set(["admin@brightloop.demo", "staff@brightloop.demo", "customer@brightloop.demo"]);
check(await db.from("system_settings").upsert({ key: "demo_access_enabled", value: false }, { onConflict: "key" }));
let page = 1, banned = 0;
while (true) {
  const { users } = check(await db.auth.admin.listUsers({ page, perPage: 1000 }));
  for (const user of users) {
    if (!emails.has(user.email?.toLowerCase())) continue;
    const profile = check(await db.from("profiles").select("is_demo").eq("id", user.id).single());
    if (!profile.is_demo) throw new Error(`Refusing to ban non-demo account ${user.email}.`);
    check(await db.auth.admin.updateUserById(user.id, { ban_duration: "876000h" }));
    banned++;
  }
  if (users.length < 1000) break;
  page++;
}
console.log(`Disabled ${banned} demo authentication account(s).`);
