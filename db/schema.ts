import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const advertisements = sqliteTable("advertisements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  courseName: text("course_name").notNull(),
  category: text("category").notNull().default("General"),
  headline: text("headline"),
  description: text("description"),
  imageUrl: text("image_url"),
  adType: text("ad_type").$type<"course" | "offer">().notNull().default("course"),
  originalPrice: integer("original_price"),
  offerPrice: integer("offer_price").notNull(),
  ctaText: text("cta_text").notNull().default("سجل الآن"),
  ctaUrl: text("cta_url").notNull(),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }),
  endsAt: integer("ends_at", { mode: "timestamp_ms" }),
  views: integer("views").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull()
});

export type Advertisement = typeof advertisements.$inferSelect;
export type NewAdvertisement = typeof advertisements.$inferInsert;


export const adminSettings = sqliteTable("admin_settings", {
  id: integer("id").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  sessionSecret: text("session_secret").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull()
});
