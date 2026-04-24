const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('fashion_feed', [
  'id', 'user_id', 'title', 'category', 'content', 'source', 'author', 'tags', 'published_date', 'created_at'
]);
