import fs from "fs";
import assert from "assert";

console.log("Running tests...");

// Load aircraft JSON directly
const raw = fs.readFileSync("./data/cessna 152.json", "utf-8");
const data = JSON.parse(raw);

// Simple validation
assert.strictEqual(data.aircraft, "Cessna 152");
assert(data.takeoffPerformance.groundRollFt > 0);

console.log("✔ Tests passed without a server");
