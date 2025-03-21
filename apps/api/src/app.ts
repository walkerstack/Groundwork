import { Hono } from "hono";

import { db } from "@agentset/db";

const app = new Hono();

app.get("/", async (c) => {
  const total = await db.user.count();
  return c.json({ message: "Hello Hono!", total });
});

export default app;
