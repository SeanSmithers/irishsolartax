import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base is "/" because the site is served from the custom domain
// irishsolartax.com (via public/CNAME). If you ever deploy without
// the custom domain, change base to "/<repo-name>/".
export default defineConfig({
  plugins: [react()],
  base: "/",
});
