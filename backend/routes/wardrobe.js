const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('wardrobe_items', [
  'id', 'user_id', 'name', 'category', 'color', 'brand', 'size', 'season', 'image_url',
  'photo_path', 'purchase_price', 'times_worn', 'style', 'occasions', 'care_instructions', 'notes', 'created_at'
]);
