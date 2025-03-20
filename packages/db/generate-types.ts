import { exec } from "child_process";

exec(
  `pnpm dlx supabase gen types typescript --schema public --db-url '${process.env.DATABASE_URL}' > src/supabase.types.ts`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      return;
    }
    if (stderr) {
      console.error(stderr);
    }

    console.log(stdout);
  },
);
