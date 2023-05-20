import aliases from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	envDir: "tests/",
	plugins: [aliases()],
	test: {
		testTimeout: 50000,
		globalSetup: ["./tests/setup/global-setup.ts"],
		setupFiles: ["./tests/setup/setup.ts"],
	},
});
