import { pgTable, uuid, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table — Admin uses email+password, Owner uses whatsappNumber+pinHash
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(), // nullable — only admin needs email
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  role: varchar('role', { length: 32 }).default('customer').notNull(), // 'admin' | 'customer'
  // WA+PIN auth fields (for Owner)
  whatsappNumber: varchar('whatsapp_number', { length: 32 }).unique(),
  pinHash: text('pin_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Businesses table (1 customer owner -> 1 business for MVP)
export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  logoUrl: text('logo_url'),
  googleMapsReviewUrl: text('google_maps_review_url'),
  googleMapsUrl: text('google_maps_url'),
  wifiEnabled: boolean('wifi_enabled').default(false).notNull(),
  wifiName: varchar('wifi_name', { length: 255 }),
  wifiPassword: varchar('wifi_password', { length: 255 }),
  whatsappNumber: varchar('whatsapp_number', { length: 32 }),
  instagramUrl: text('instagram_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// QR Batches table (groups packages of QRs together)
export const qrBatches = pgTable('qr_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  batchCode: varchar('batch_code', { length: 64 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// QR Codes table
// Status enum values: 'blank', 'sold', 'active', 'disabled'
export const qrCodes = pgTable('qr_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  status: varchar('status', { length: 32 }).default('blank').notNull(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'set null' }),
  batchId: uuid('batch_id').references(() => qrBatches.id, { onDelete: 'set null' }),
  deviceName: varchar('device_name', { length: 255 }),
  googleMapsReviewUrl: text('google_maps_review_url'),
  googleMapsUrl: text('google_maps_url'),
  wifiEnabled: boolean('wifi_enabled').default(false).notNull(),
  wifiName: varchar('wifi_name', { length: 255 }),
  wifiPassword: varchar('wifi_password', { length: 255 }),
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

// Customer Feedback & Rating table
export const customerFeedback = pgTable('customer_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  qrId: uuid('qr_id').references(() => qrCodes.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(), // 1 to 5
  message: text('message'),
  customerName: varchar('customer_name', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 32 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Drizzle Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  qrCodes: many(qrCodes),
  feedbacks: many(customerFeedback),
}));

export const qrBatchesRelations = relations(qrBatches, ({ many }) => ({
  qrCodes: many(qrCodes),
}));

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  business: one(businesses, {
    fields: [qrCodes.businessId],
    references: [businesses.id],
  }),
  batch: one(qrBatches, {
    fields: [qrCodes.batchId],
    references: [qrBatches.id],
  }),
  scanLogs: many(scanLogs),
  feedbacks: many(customerFeedback),
}));

export const scanLogsRelations = relations(scanLogs, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [scanLogs.qrId],
    references: [qrCodes.id],
  }),
}));

export const customerFeedbackRelations = relations(customerFeedback, ({ one }) => ({
  business: one(businesses, {
    fields: [customerFeedback.businessId],
    references: [businesses.id],
  }),
  qrCode: one(qrCodes, {
    fields: [customerFeedback.qrId],
    references: [qrCodes.id],
  }),
}));
