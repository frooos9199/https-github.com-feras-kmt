<<<<<<< HEAD
// Temporarily disabled to fix build issues
// import "dotenv/config";
// import { defineConfig, env } from "prisma/config";

// export default defineConfig({
//   schema: "prisma/schema.prisma",
//   migrations: {
//     path: "prisma/migrations",
//   },
//   engine: "classic",
//   datasource: {
//     url: env("DATABASE_URL"),
//   },
// });
=======
import { defineConfig } from '@prisma/prisma';

export default defineConfig({
  datasource: {
    url: "postgresql://neondb_owner:npg_KhOZXzlMA6u5@ep-shiny-mouse-ad9ji62n-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    db: {
      provider: 'postgresql',
      url: "postgresql://neondb_owner:npg_KhOZXzlMA6u5@ep-shiny-mouse-ad9ji62n-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    },
  },
});
>>>>>>> 5f4758b (resolve conflicts and add DATABASE_URL to prisma schema)
