const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('seasonal_items', [
  'id', 'user_id', 'item_name', 'category', 'season', 'status', 'storage_location', 'condition', 'notes', 'created_at'
]);
