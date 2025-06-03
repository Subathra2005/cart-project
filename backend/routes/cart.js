const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    const { userId } = req.query;
    db.query('SELECT * FROM cart_items where user_id = ?',[userId], (err, results) => {
        if(err) return res.status(500).send(err);
        res.json(results);
    });
});

router.post('/', (req, res) => {
  const { name, price, quantity, userId, productId } = req.body;

  db.query(
    'SELECT * FROM cart_items WHERE name = ? AND user_id = ?',
    [name, userId],
    (err, results) => {
      if (err) return res.status(500).send(err);

      if (results.length > 0) {
        return res.status(400).json({ message: 'Product already exists in the cart.' });
      } else {
        db.query(
          'INSERT INTO cart_items (name, price, quantity, user_id, product_id) VALUES (?, ?, ?, ?, ?)',
          [name, price, quantity, userId, productId],
          (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ id: result.insertId, name, price, quantity, userId, productId });
          }
        );
      }
    }
  );
});



router.put('/:id', (req, res) => {
  const { name, price, quantity, userId } = req.body;
  const { id } = req.params;

  // Update only if the item belongs to the user
  db.query(
    'UPDATE cart_items SET name = ?, price = ?, quantity = ? WHERE id = ? AND user_id = ?',
    [name, price, quantity, id, userId],
    (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.affectedRows === 0) {
        // Either item doesn't exist or doesn't belong to this user
        return res.status(403).json({ success: false, message: 'Unauthorized or item not found' });
      }

      res.sendStatus(200);
    }
  );
});


router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  db.query('DELETE FROM cart_items WHERE id = ? and user_id = ?', [id,userId], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

// Signup Route
router.post('/signup', async (req, res) => {
  console.log('Received signup data:', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(sql, [email, hashed], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Signup failed' });
      }

      res.json({ success: true, message: 'Signup success' });
    });
  } catch (error) {
    console.error('Hashing error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) return res.status(400).send('User not found');

    const match = await bcrypt.compare(password, results[0].password);
    if (match) {
      return res.json({ success: true, userId: results[0].id }); 
    } else {
      return res.status(401).json({ success: false, message: 'Wrong password' });
    }
  });
});



module.exports = router;