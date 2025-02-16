module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.SUPABASE_HOST,
      user: process.env.SUPABASE_USER,
      password: process.env.SUPABASE_PASSWORD,
      database: process.env.SUPABASE_DATABASE,
      port: process.env.SUPABASE_PORT,
    },
    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations",
    },
  },
};
