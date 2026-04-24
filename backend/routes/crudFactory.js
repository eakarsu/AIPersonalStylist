const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function createCrudRouter(tableName, columns) {
  const router = express.Router();

  // GET all
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.userId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET one
  router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const fields = columns.filter(c => c !== 'id' && c !== 'created_at' && c !== 'user_id');
      const values = fields.map(f => req.body[f]);
      const placeholders = fields.map((_, i) => `$${i + 1}`);

      const result = await pool.query(
        `INSERT INTO ${tableName} (user_id, ${fields.join(', ')}) VALUES ($${fields.length + 1}, ${placeholders.join(', ')}) RETURNING *`,
        [...values, req.userId]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  router.put('/:id', authMiddleware, async (req, res) => {
    try {
      const fields = columns.filter(c => c !== 'id' && c !== 'created_at' && c !== 'user_id');
      const setClauses = fields.map((f, i) => `${f} = $${i + 1}`);
      const values = fields.map(f => req.body[f]);

      const result = await pool.query(
        `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} RETURNING *`,
        [...values, req.params.id, req.userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM ${tableName} WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;
