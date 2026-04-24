const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('color_palettes', [
  'id', 'user_id', 'color_name', 'hex_code', 'season_type', 'category', 'complements', 'notes', 'created_at'
]);
