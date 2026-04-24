const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('mix_match', [
  'id', 'user_id', 'name', 'top', 'bottom', 'shoes', 'accessories', 'style', 'occasion', 'rating', 'created_at'
]);
