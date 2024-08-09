DO $$ BEGIN
 CREATE TYPE "public"."blacklist_type" AS ENUM('user', 'guild');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blacklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blacklist_id" varchar NOT NULL,
	"blacklist_type" "blacklist_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discord_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "blacklist_blacklist_id_uidx" ON "blacklist" USING btree ("blacklist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blacklist_blacklist_type_enum_idx" ON "blacklist" USING btree ("blacklist_type");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_discord_id_uidx" ON "user" USING btree ("discord_id");