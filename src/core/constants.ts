import type { ColorResolvable } from "discord.js";

export const DEVELOPERS: string[] = ["327849142774923266"] as const;

export const DEVELOPMENT_SERVERS: string[] = ["909618952634781716", "1209737959587450980"] as const;

export const COLORS = {
    primary: "#c4a7e7" as ColorResolvable,
    secondary: "#9ccfd8" as ColorResolvable,
    success: "#f6c177" as ColorResolvable,
    error: "#ebbcba" as ColorResolvable,
} as const;
