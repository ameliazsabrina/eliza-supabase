import { SupabaseDatabaseAdapter } from "@elizaos/adapter-supabase";
import { createClient } from "@supabase/supabase-js";

export function initializeDatabase(dataDir: string) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    // Create a Supabase client
    const supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    // Initialize the SupabaseDatabaseAdapter with the client
    const db = new SupabaseDatabaseAdapter(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    return db;
  }
  throw new Error("Supabase URL and Key must be set in environment variables");
}
