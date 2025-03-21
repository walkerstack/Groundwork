import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["api/index.ts"],
  outDir: "dist/api",
  target: "node22",
  splitting: false,
  sourcemap: true,
  clean: true,
  format: "esm",
  dts: true,
  external: ["@agentset/db"],
});
