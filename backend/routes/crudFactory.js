const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function createCrudRouter(tableName, columns) {
  const router = express.Router();

  // GET all (with optional pagination via ?page=1&limit=20)
  router.get('/', authMiddleware, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM ${tableName} WHERE user_id = $1`,
        [req.userId]
      );
      const total = parseInt(countResult.rows[0].count);

      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
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

      // Validate required fields (first non-nullable text field is assumed required if body is empty)
      const missingFields = fields.filter(f => {
        const val = req.body[f];
        return val === undefined || val === null || val === '';
      });
      // Only enforce the first field as required (typically 'name' or primary descriptor)
      const firstField = fields[0];
      if (firstField && (req.body[firstField] === undefined || req.body[firstField] === null || req.body[firstField] === '')) {
        return res.status(400).json({ error: `Missing required field: ${firstField}`, missing: [firstField] });
      }

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
