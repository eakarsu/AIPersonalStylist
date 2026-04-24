const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('clothing_care', [
  'id', 'user_id', 'garment_type', 'material', 'wash_method', 'dry_method', 'iron_temp', 'storage', 'special_notes', 'created_at'
]);
