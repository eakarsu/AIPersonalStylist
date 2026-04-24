const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('shopping_items', [
  'id', 'user_id', 'item_name', 'category', 'brand', 'price', 'priority', 'store', 'status', 'notes', 'created_at'
]);
