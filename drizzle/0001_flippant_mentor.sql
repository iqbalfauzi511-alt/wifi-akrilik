CREATE TABLE "finance_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(16) NOT NULL,
	"category" varchar(64) NOT NULL,
	"amount" integer NOT NULL,
	"transaction_date" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text,
	"reference_number" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"finance_transaction_id" uuid,
	"entry_number" varchar(64) NOT NULL,
	"entry_date" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text,
	"reference_number" varchar(64),
	"transaction_type" varchar(32) DEFAULT 'jurnal_umum' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"account_code" varchar(16) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"debit" integer DEFAULT 0 NOT NULL,
	"credit" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_feedback" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "customer_feedback" CASCADE;--> statement-breakpoint
ALTER TABLE "qr_codes" ALTER COLUMN "wifi_enabled" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "qr_codes" ALTER COLUMN "wifi_enabled" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scan_logs" ADD COLUMN "action_type" varchar(32) DEFAULT 'page_view' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "failed_login_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_finance_transaction_id_finance_transactions_id_fk" FOREIGN KEY ("finance_transaction_id") REFERENCES "public"."finance_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_items" ADD CONSTRAINT "journal_items_entry_id_journal_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" DROP COLUMN "activation_code";