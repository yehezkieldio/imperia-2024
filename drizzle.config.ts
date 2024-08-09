import { envVariables } from "@/lib/env";

// Parse the environment variables and verify their existence and correctness.
envVariables.parse(process.env);

import type { Config } from "drizzle-kit";

export default {
    schema: "./src/lib/databases/postgres/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    tablesFilter: ["imperia_*"],
    out: "./migrations",
} satisfies Config;
