import { neon } from "@neondatabase/serverless"

async function testConnection() {
  try {
    console.log("Testing database connection...")

    // Check if DATABASE_URL is defined
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not defined")
    }

    // Create a Neon SQL client
    const sql = neon(process.env.DATABASE_URL)

    // Execute a simple query
    const result = await sql`SELECT current_timestamp as time`

    console.log("Connection successful!")
    console.log("Current timestamp from database:", result[0].time)

    // List tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    console.log("\nExisting tables:")
    if (tables.length === 0) {
      console.log("No tables found in the public schema")
    } else {
      tables.forEach((table) => {
        console.log(`- ${table.table_name}`)
      })
    }
  } catch (error) {
    console.error("Error connecting to database:", error)
  }
}

testConnection()
