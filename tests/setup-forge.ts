import fs from "fs";
import { Hex } from "viem";

const INTEROP_FILE = "./tests/forge/test-calldata.json";

// updates the interop file with a new fixture
export function registerFixture(key: string, data: Hex, value: String) {
	let interop: { [key: string]: any } = fs.existsSync(INTEROP_FILE)
		? JSON.parse(fs.readFileSync(INTEROP_FILE).toString())
		: {};

	interop[key] = {
		calldata: data,
		value: value,
	};
	fs.writeFileSync(INTEROP_FILE, JSON.stringify(interop, null, 2));
}
