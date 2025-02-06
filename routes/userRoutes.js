// routes/sample.js
/**
 * @swagger
 * /sample:
 *   get:
 *     summary: Returns a sample message
 *     responses:
 *       200:
 *         description: A successful response
 */
const express = require('express');
const router = express.Router();
const db = require('../DB/mysqldb');

router.post('/users', (req, res) => {
    const { username, email, password, role } = req.body;
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, password, role || 'user'], (err, results) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: results.insertId, username, email, role: role || 'user' });
    });
  });
  
  module.exports = router;