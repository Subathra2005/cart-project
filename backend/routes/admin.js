const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

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
router.get('/orders', async (req, res) => {
  console.log('GET /api/admin/orders hit');
  try {
    const [orders] = await db.promise().query(
      `SELECT o.*, u.email, u.address 
       FROM orders o 
       JOIN users u ON o.user_id = u.id`
    );
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

router.post('/orders/:id/status', async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  const orderId = req.params.id;

  const [[order]] = await db.promise().query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const [[user]] = await db.promise().query('SELECT email FROM users WHERE id = ?', [order.user_id]);

  await db.promise().query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

  const details = order.order_details;
  const itemsList = details.map(i => `${i.name} x${i.quantity} - $${i.price}`).join('\n');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
      user: 'subathrar2005@gmail.com',
      pass: 'oufkctkysezfxyqq'
    }
  });

  const mailText =
    status === 'accepted'
      ? `Your order (ID: ${orderId}) has been delivered.\n\nItems:\n${itemsList}`
      : `Your order (ID: ${orderId}) has been rejected.\n\nItems:\n${itemsList}`;

  await transporter.sendMail({
    from: 'subathrar2005@gmail.com',
    to: user.email,
    subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    text: mailText
  });

  res.json({ success: true, message: `Order ${status}` });
});
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


module.exports = router;