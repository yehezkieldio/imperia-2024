CREATE TABLE IF NOT EXISTS "guild" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discord_id" varchar NOT NULL,
	"commands_disabled" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "guild_discord_id_uidx" ON "guild" USING btree ("discord_id");