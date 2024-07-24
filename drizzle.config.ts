import { env } from "@/environment";
import type { Config } from "drizzle-kit";

export default {
    schema: "./src/core/databases/postgres/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    tablesFilter: ["imperia_*"],
    out: "./migrations",
} satisfies Config;
