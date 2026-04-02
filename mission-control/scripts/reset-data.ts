/**
 * Reset Script — clears all user data back to a blank slate.
 *
 * Preserves: agents.json, skills-library.json, daemon-config.json,
 *            service-catalog.json, templates.json, approval-config.json,
 *            safety-limits.json
 *
 * Clears: tasks, goals, projects, inbox, brain-dump, activity-log, decisions,
 *         tasks-archive, missions, active-runs, respond-runs,
 *         field-ops/services, field-ops/missions, field-ops/tasks,
 *         field-ops/activity-log, field-ops/.credentials (vault)
 *
 * Run with: npx tsx scripts/reset-data.ts
 */

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import * as readline from "readline";

const dataDir = join(__dirname, "..", "data");
const fieldOpsDir = join(dataDir, "field-ops");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("This will delete all tasks, goals, projects, inbox, vault, and field-ops data. Are you sure? (yes/no): ", (answer) => {
  rl.close();

  if (answer.trim().toLowerCase() !== "yes") {
    console.log("Aborted.");
    process.exit(0);
  }

  if (!existsSync(fieldOpsDir)) {
    mkdirSync(fieldOpsDir, { recursive: true });
  }

  const files: Record<string, unknown> = {
    "tasks.json":         { tasks: [] },
    "tasks-archive.json": { tasks: [] },
    "goals.json":         { goals: [] },
    "projects.json":      { projects: [] },
    "brain-dump.json":    { entries: [] },
    "inbox.json":         { messages: [] },
    "activity-log.json":  { events: [] },
    "decisions.json":     { decisions: [] },
    "missions.json":      { missions: [] },
    "active-runs.json":   { runs: [] },
    "respond-runs.json":  { runs: [] },
  };

  const fieldOpsFiles: Record<string, unknown> = {
    "services.json":     { services: [] },
    "missions.json":     { missions: [] },
    "tasks.json":        { tasks: [] },
    "activity-log.json": { events: [] },
    // Hidden file — stores vault master password hash + encrypted credentials
    ".credentials.json": { masterKeyHash: null, masterKeySalt: null, credentials: [] },
  };

  console.log("\nResetting data files...");

  for (const [filename, data] of Object.entries(files)) {
    const filePath = join(dataDir, filename);
    writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`  ✓ ${filename}`);
  }

  for (const [filename, data] of Object.entries(fieldOpsFiles)) {
    const filePath = join(fieldOpsDir, filename);
    writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`  ✓ field-ops/${filename}`);
  }

  console.log("\n✅ Reset complete.");
  console.log("   Preserved: agents.json, skills-library.json, daemon-config.json,");
  console.log("              service-catalog.json, templates.json, approval-config.json, safety-limits.json");
  console.log("   Start the app: pnpm dev  (or double-click start-mission-control.command)\n");
});
