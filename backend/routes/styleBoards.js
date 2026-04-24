const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('style_boards', [
  'id', 'user_id', 'name', 'theme', 'description', 'mood', 'colors', 'inspiration', 'notes', 'created_at'
]);
