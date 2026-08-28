import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

export type Env = {
  DB: D1Database;
  APP_NAME?: string;
};

export function getEnv(): Env {
  const { env } = getCloudflareContext();
  return env as unknown as Env;
}
