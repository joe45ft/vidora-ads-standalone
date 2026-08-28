import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

export type Env = {
  DB: D1Database;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  APP_NAME?: string;
};

export function getEnv(): Env {
  const { env } = getCloudflareContext();
  return env as unknown as Env;
}
