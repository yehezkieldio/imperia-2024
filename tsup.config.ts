import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/**/*.ts"],
    outDir: "dist/",
    splitting: false,
    sourcemap: true,
    clean: true,
    target: "es2022",
    tsconfig: "tsconfig.json",
    format: ["esm"],
    skipNodeModulesBundle: true,
    dts: false,
    shims: false,
});
