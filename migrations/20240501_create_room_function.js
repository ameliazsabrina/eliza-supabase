exports.up = function (knex) {
  return knex.raw(`
    CREATE OR REPLACE FUNCTION public.create_room(roomId UUID)
    RETURNS VOID AS $$
    BEGIN
        INSERT INTO rooms (id) VALUES (roomId);
    END;
    $$ LANGUAGE plpgsql;
  `);
};

exports.down = function (knex) {
  return knex.raw("DROP FUNCTION IF EXISTS public.create_room(UUID);");
};
