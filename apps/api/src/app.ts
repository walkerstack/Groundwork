import { Hono } from "hono";

import { db } from "@agentset/db";

import { env } from "./env";

const app = new Hono();

app.get("/", async (c) => {
  const total = await db.user.count();
  return c.json({ message: "Hello Hono!", total });
});

export default app;
