DO $$ BEGIN
 CREATE TYPE "public"."command_result_type" AS ENUM('success', 'error', 'denied');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."command_type" AS ENUM('chatinput', 'message');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command_analytic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"guild_id" varchar NOT NULL,
	"command" varchar NOT NULL,
	"result" "command_result_type" NOT NULL,
	"type" "command_type" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "command_analytic_user_id_idx" ON "command_analytic" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "command_analytic_guild_id_idx" ON "command_analytic" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "command_analytic_command_idx" ON "command_analytic" USING btree ("command");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "command_analytic_result_idx" ON "command_analytic" USING btree ("result");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "command_analytic_created_at_idx" ON "command_analytic" USING btree ("created_at");