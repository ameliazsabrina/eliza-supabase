exports.up = function (knex) {
  return knex.schema.alterTable("participants", (table) => {
    table.timestamp("last_message_read").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("participants", (table) => {
    table.dropColumn("last_message_read");
  });
};
