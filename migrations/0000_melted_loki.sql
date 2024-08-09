DO $$ BEGIN
 CREATE TYPE "public"."blacklist_type_enum" AS ENUM('user', 'guild');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."command_result_type_enum" AS ENUM('success', 'error', 'denied');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."command_type_enum" AS ENUM('chatinput', 'message');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blacklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blacklist_id" varchar NOT NULL,
	"blacklist_type" "blacklist_type_enum" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command_analytic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"guild_id" varchar NOT NULL,
	"command" varchar NOT NULL,
	"result" "command_result_type_enum" NOT NULL,
	"type" "command_type_enum" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discord_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "blacklist_blacklist_id_uidx" ON "blacklist" USING btree ("blacklist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blacklist_blacklist_type_enum_idx" ON "blacklist" USING btree ("blacklist_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "command_analytic_user_id_idx" ON "command_analytic" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "command_analytic_guild_id_idx" ON "command_analytic" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "command_analytic_command_idx" ON "command_analytic" USING btree ("command");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "command_analytic_result_idx" ON "command_analytic" USING btree ("result");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "command_analytic_created_at_idx" ON "command_analytic" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_discord_id_uidx" ON "user" USING btree ("discord_id");