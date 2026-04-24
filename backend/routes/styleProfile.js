const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('style_profiles', [
  'id', 'user_id', 'attribute', 'value', 'category', 'importance', 'notes', 'created_at'
]);
