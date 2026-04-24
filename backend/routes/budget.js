const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('budget_entries', [
  'id', 'user_id', 'item_name', 'category', 'amount', 'purchase_date', 'store', 'payment_method', 'notes', 'created_at'
]);
