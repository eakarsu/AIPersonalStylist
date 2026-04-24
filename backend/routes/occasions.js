const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('occasions', [
  'id', 'user_id', 'name', 'event_date', 'dress_code', 'location', 'outfit_plan', 'budget', 'notes', 'created_at'
]);
