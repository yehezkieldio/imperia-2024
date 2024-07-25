import { type InferType, s } from "@sapphire/shapeshift";

export const envVariables = s.object({
	DATABASE_URL: s.string(),
});

declare module "bun" {
	interface Env extends InferType<typeof envVariables> {}
}
