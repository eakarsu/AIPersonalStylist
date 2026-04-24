const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('outfit_calendar', [
  'id', 'user_id', 'date', 'occasion', 'outfit_name', 'top', 'bottom', 'shoes', 'weather', 'notes', 'created_at'
]);
