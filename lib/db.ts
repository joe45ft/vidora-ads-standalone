import { drizzle } from "drizzle-orm/d1";
import { getEnv } from "@/lib/cloudflare";

export function getDb() {
  return drizzle(getEnv().DB);
}
