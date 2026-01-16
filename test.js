import assert from "assert";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("Running tests...\n");

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(healthRes.status, 200);
  const health = await healthRes.json();
  assert.strictEqual(health.status, "ok");
  console.log("✔ Server health check passed");

  // 2. Load aircraft data
  const aircraftRes = await fetch(
    `${BASE_URL}/data/cessna_152_specifications.json`
  );
  assert.strictEqual(aircraftRes.status, 200);
  const aircraftData = await aircraftRes.json();
  console.log("✔ Aircraft JSON loaded");

  // 3. Validate critical fields
  assert(aircraftData.aircraft === "Cessna 152");
  assert(aircraftData.takeoffPerformance);
  assert(aircraftData.takeoffPerformance.groundRollFt > 0);
  assert(aircraftData.takeoffPerformance.distanceOver50FtObstacleFt > 0);
  assert(aircraftData.weights.maximum.takeoffLandingLb === 1670);

  console.log("✔ Aircraft data structure valid");

  console.log("\nAll tests passed. Nothing is on fire.");
}

runTests().catch(err => {
  console.error("\nTEST FAILED");
  console.error(err);
  process.exit(1);
});
