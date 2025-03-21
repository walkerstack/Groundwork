import baseConfig, { restrictEnvAccess } from "@agentset/eslint-config/base";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".vercel/**"],
  },
  ...baseConfig,
  ...restrictEnvAccess,
];
