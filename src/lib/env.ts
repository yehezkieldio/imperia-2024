import { type InferType, s } from "@sapphire/shapeshift";

export const envVariables = s.object({
    NODE_ENV: s.enum(["development", "production", "test"]).default("development"),
    DISCORD_TOKEN: s.string(),
    DATABASE_URL: s.string(),
    DRAGONFLY_HOST: s.string(),
    DRAGONFLY_PORT: s.string().transform((value) => Number.parseInt(value, 10)),
});

declare module "bun" {
    interface Env extends InferType<typeof envVariables> {}
}
