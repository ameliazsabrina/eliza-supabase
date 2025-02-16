import { PostgresDatabaseAdapter } from "@elizaos/adapter-postgres";
import { elizaLogger } from "@elizaos/core";

// PostgreSQL Configuration
const postgresConfig = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export function initializeDatabase(dataDir: string) {
  try {
    // Validate environment variables
    if (
      !process.env.POSTGRES_HOST ||
      !process.env.POSTGRES_PORT ||
      !process.env.POSTGRES_USER ||
      !process.env.POSTGRES_PASSWORD
    ) {
      throw new Error(
        "Postgres environment variables (POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD) must be set"
      );
    }

    elizaLogger.log("Initializing Postgres database connection...");

    // Create the PostgresDatabaseAdapter
    const db = new PostgresDatabaseAdapter({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ...postgresConfig, // Spread the PostgreSQL configuration
    });

    elizaLogger.success(
      "Postgres database connection initialized successfully"
    );

    return db;
  } catch (error) {
    elizaLogger.error("Failed to initialize Postgres database:", error);
    throw error;
  }
}

export async function validateDatabaseConnection(db: PostgresDatabaseAdapter) {
  try {
    await db.init(); // Assuming there's an init method
    elizaLogger.success("Database connection validated successfully");
    return true;
  } catch (error) {
    elizaLogger.error("Database connection validation failed:", error);
    throw error;
  }
}
