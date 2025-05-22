// This script is used to run the push-schema.ts script with the correct environment variables
const { execSync } = require("child_process")
const path = require("path")

// Get the DATABASE_URL from the environment
const databaseUrl = 'postgresql://neondb_owner:npg_k8jUovCNqGL3@ep-bitter-unit-a2eqoxyp-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is not defined")
  process.exit(1)
}

try {
  // Run the push-schema.ts script
  execSync("npx tsx scripts/push-schema.ts", {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: "inherit",
  })
} catch (error) {
  console.error("Error running push-schema.ts:", error)
  process.exit(1)
}
