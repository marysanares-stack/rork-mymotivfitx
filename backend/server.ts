import { serve } from '@hono/node-server'
import app from "./hono";

const port = parseInt(process.env.PORT || "3000", 10);

console.log(`🚀 Server starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
})

console.log(`✅ Server running at http://localhost:${port}`);
