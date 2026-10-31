import { z } from "zod";

/** Variables safe to expose to the browser. Must be referenced literally so Next can inline them. */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

/** Server-only secrets. Never import this file from a client component. */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  DEMO_ACCESS_ENABLED: z.enum(["true", "false"]).default("false"),
  DEMO_ADMIN_PASSWORD: z.preprocess((v) => v === "" ? undefined : v, z.string().min(12).optional()),
  DEMO_STAFF_PASSWORD: z.preprocess((v) => v === "" ? undefined : v, z.string().min(12).optional()),
  DEMO_CUSTOMER_PASSWORD: z.preprocess((v) => v === "" ? undefined : v, z.string().min(12).optional()),
  CRON_SECRET: z.string().min(16).optional(),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export function publicEnv() {
  return publicSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}

/** Demo credentials are intentionally read only by server components and are omitted when disabled. */
export function demoConfig() {
  if (typeof window !== "undefined") throw new Error("demoConfig() must not be called in the browser");
  if (process.env.DEMO_ACCESS_ENABLED !== "true") return null;
  const passwords = [process.env.DEMO_ADMIN_PASSWORD, process.env.DEMO_STAFF_PASSWORD, process.env.DEMO_CUSTOMER_PASSWORD];
  if (passwords.some((password) => !password || password.length < 12) || new Set(passwords).size !== 3) return null;
  return {
    admin: { email: "admin@brightloop.demo", password: process.env.DEMO_ADMIN_PASSWORD! },
    staff: { email: "staff@brightloop.demo", password: process.env.DEMO_STAFF_PASSWORD! },
    customer: { email: "customer@brightloop.demo", password: process.env.DEMO_CUSTOMER_PASSWORD! },
  };
}

export function serverEnv() {
  if (typeof window !== "undefined") throw new Error("serverEnv() must not be called in the browser");
  return serverSchema.parse(process.env);
}
