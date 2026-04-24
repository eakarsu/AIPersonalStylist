const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('wardrobe_items', [
  'id', 'user_id', 'name', 'category', 'color', 'brand', 'size', 'season', 'image_url', 'notes', 'created_at'
]);
