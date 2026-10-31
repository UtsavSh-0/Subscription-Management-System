import { NextResponse } from "next/server";
import { z } from "zod";
import { handler } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";

const body = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email()),
  message: z.string().trim().min(10).max(2000),
  website: z.string().optional(),   // honeypot: real users never fill this
});

/** Public endpoint. The table has no public policy, so inserts go through the service role after validation. */
export const POST = handler(async (req: Request) => {
  const input = body.parse(await req.json());
  if (input.website) return NextResponse.json({ ok: true });   // silently drop bots
  const { error } = await createAdminClient().from("contact_messages").insert({ name: input.name, email: input.email, message: input.message });
  if (error) throw error;
  return NextResponse.json({ ok: true }, { status: 201 });
});
