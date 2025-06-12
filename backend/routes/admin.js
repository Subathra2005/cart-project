const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

router.get('/role', (req, res) => { 
  const { userId } = req.query;
  db.query('SELECT role FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ role: results[0].role });
  }
  );
}
);
router.post('/', (req, res) => {
  const { name, price, quantity} = req.body;
  db.query('INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)',
    [name, price, quantity],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId, name, price, quantity});
    });
}
);
router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  }
  );
}
);
router.get('/:id', (req, res) => {
  const productId = req.params.id;

  db.query('SELECT quantity FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length === 0) {
      return res.status(404).send({ message: 'Product not found' });
    }

    res.json({ quantity: results[0].quantity });
  });
});

router.delete('/:id', (req, res) => { 
  const { id } = req.params;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  }
  );

}
);
router.put("/edit", (req, res) => {
  const { id, name, price, quantity } = req.body;

  if (!id || !name || price === undefined || quantity === undefined) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = "UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?";

  db.query(query, [name, price, quantity, id], (err, result) => {
    if (err) {
      console.error("Error updating product:", err);
      return res.status(500).json({ error: "Failed to update product." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.json({ id, name, price, quantity });
  });
});

module.exports = router;