import { handle } from "hono/vercel";

import app from "../src/app";
import { env } from "../src/env";

// export const config = {
//   runtime: "edge",
// };

export default handle(app);
