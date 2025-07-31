// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const createTable = pgTableCreator((name) => `bithub_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

export const rooms = createTable(
  "room",
  (d) => ({
    id: d.text("id").primaryKey(),
    code: d.text("code").unique().notNull(),
    status: d.text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
    maxPlayers: d.integer("max_players").default(6).notNull(),
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    updatedAt: d.timestamp("updated_at").defaultNow().notNull(),
    type: d.text("type", { enum: ["office", "arcade"] }).default("office").notNull(),
    visibility: d.text("visibility", { enum: ["public", "private"] }).default("public").notNull(),
    password: d.text("password").notNull(), 
  })
);

export const players = createTable(
  "player",
  (d) => ({
    id: d.text("id").primaryKey(),
    x: d.integer("x").default(0).notNull(), 
    y: d.integer("y").default(0).notNull(),
    
    userId: d.text("user_id").references(() => user.id, { onDelete: "cascade" }),
    

    roomId: d.text("room_id").references(() => rooms.id, { onDelete: "cascade" }),
    
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    updatedAt: d.timestamp("updated_at").defaultNow().notNull(),
  })
);

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
