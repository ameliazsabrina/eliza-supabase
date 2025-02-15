import { SupabaseDatabaseAdapter } from "@elizaos/adapter-supabase";

export function initializeDatabase(dataDir: string) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    const db = new SupabaseDatabaseAdapter(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
    return db;
  }
  throw new Error("Supabase URL and Key must be set in environment variables");
}
