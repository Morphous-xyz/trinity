import aliases from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	envDir: "tests/",
	plugins: [aliases()],
});
