import { env } from "@/environment";
import type { Config } from "drizzle-kit";

export default {
    schema: "./src/internal/database/postgres/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    tablesFilter: ["imperia_*"],
    out: "./migrations",
} satisfies Config;
