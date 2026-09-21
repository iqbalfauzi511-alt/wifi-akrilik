import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (mirrors / connects with Supabase Auth users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 32 }).default('customer').notNull(), // 'admin' | 'customer'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Businesses table (1 customer owner -> 1 business for MVP)
export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  instagramUrl: text('instagram_url').notNull(),
  wifiName: varchar('wifi_name', { length: 255 }).notNull(),
  wifiPassword: varchar('wifi_password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// QR Codes table
// Status enum values: 'blank', 'sold', 'active', 'disabled'
export const qrCodes = pgTable('qr_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  status: varchar('status', { length: 32 }).default('blank').notNull(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  soldAt: timestamp('sold_at', { withTimezone: true }),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
});

// Scan logs table
export const scanLogs = pgTable('scan_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  qrId: uuid('qr_id').notNull().references(() => qrCodes.id, { onDelete: 'cascade' }),
  scannedAt: timestamp('scanned_at', { withTimezone: true }).defaultNow().notNull(),
  userAgent: text('user_agent'),
});

// Drizzle Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  business: one(businesses, {
    fields: [users.id],
    references: [businesses.ownerId],
  }),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  qrCodes: many(qrCodes),
}));

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  business: one(businesses, {
    fields: [qrCodes.businessId],
    references: [businesses.id],
  }),
  scanLogs: many(scanLogs),
}));

export const scanLogsRelations = relations(scanLogs, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [scanLogs.qrId],
    references: [qrCodes.id],
  }),
}));
