import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "api",
  target: "node22",
  splitting: false,
  sourcemap: false,
  clean: true,
  format: "esm",
  dts: false,
  external: ["@agentset/db"],
});
