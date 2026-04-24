const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('trends', [
  'id', 'user_id', 'name', 'category', 'season', 'year', 'description', 'popularity', 'source', 'created_at'
]);
