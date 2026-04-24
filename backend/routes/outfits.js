const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('outfits', [
  'id', 'user_id', 'name', 'occasion', 'top', 'bottom', 'shoes', 'accessories', 'rating', 'notes', 'created_at'
]);
