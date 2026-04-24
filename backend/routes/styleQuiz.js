const createCrudRouter = require('./crudFactory');
module.exports = createCrudRouter('style_quiz', [
  'id', 'user_id', 'question', 'answer', 'category', 'score', 'result_type', 'notes', 'created_at'
]);
