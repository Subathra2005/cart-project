const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  const { userId } = req.query;
  db.query(
    "SELECT * FROM cart_items where user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    }
  );
});

router.get("/email", (req, res) => {
  const { userId } = req.query;

  db.query("SELECT email FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send("User not found");

    res.json(results[0]); // { email: "user@example.com" }
  });
});

router.post("/", (req, res) => {
  const { name, price, quantity, userId, productId } = req.body;

  db.query(
    "SELECT * FROM cart_items WHERE name = ? AND user_id = ?",
    [name, userId],
    (err, results) => {
      if (err) return res.status(500).send(err);

      if (results.length > 0) {
        return res
          .status(400)
          .json({ message: "Product already exists in the cart." });
      } else {
        db.query(
          "INSERT INTO cart_items (name, price, quantity, user_id, product_id) VALUES (?, ?, ?, ?, ?)",
          [name, price, quantity, userId, productId],
          (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({
              id: result.insertId,
              name,
              price,
              quantity,
              userId,
              productId,
            });
          }
        );
      }
    }
  );
});

router.put("/:id", (req, res) => {
  const { name, price, quantity, userId } = req.body;
  const { id } = req.params;

  // Update only if the item belongs to the user
  db.query(
    "UPDATE cart_items SET name = ?, price = ?, quantity = ? WHERE id = ? AND user_id = ?",
    [name, price, quantity, id, userId],
    (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.affectedRows === 0) {
        // Either item doesn't exist or doesn't belong to this user
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized or item not found" });
      }

      res.sendStatus(200);
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  db.query(
    "DELETE FROM cart_items WHERE id = ? and user_id = ?",
    [id, userId],
    (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    }
  );
});

// Signup Route
router.post("/signup", async (req, res) => {
  console.log("Received signup data:", req.body);

  const { email, password, address } = req.body;

  if (!email || !password || !address) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (email, password,address) VALUES (?, ?,?)";
    db.query(sql, [email, hashed, address], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ success: false, message: "Email already registered" });
        }
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Signup failed" });
      }

      res.json({ success: true, message: "Signup success" });
    });
  } catch (error) {
    console.error("Hashing error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).send("Server error");
    if (results.length === 0) return res.status(400).send("User not found");

    const match = await bcrypt.compare(password, results[0].password);
    if (match) {
      return res.json({ success: true, userId: results[0].id, role: results[0].role });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Wrong password" });
    }
  });
});
const nodemailer = require("nodemailer");

router.post("/checkout", async (req, res) => {
  const { userId, email } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  db.query(
    "SELECT * FROM cart_items WHERE user_id = ?",
    [userId],
    async (err, cartItems) => {
      if (err) return res.status(500).json({ message: "DB Error", error: err });
      if (cartItems.length === 0)
        return res.status(400).json({ message: "Cart is empty." });

      let totalAmount = 0;
      const errors = [];

      try {
        // Step 1: Check stock and update quantities
        for (const item of cartItems) {
          totalAmount += item.quantity * item.price;

          const [productResult] = await db
            .promise()
            .query("SELECT quantity FROM products WHERE id = ?", [
              item.product_id,
            ]);

          const productStock = productResult[0]?.quantity ?? 0;

          if (productStock < item.quantity) {
            errors.push(`Not enough stock for ${item.name}`);
            continue;
          }

          await db
            .promise()
            .query("UPDATE products SET quantity = quantity - ? WHERE id = ?", [
              item.quantity,
              item.product_id,
            ]);
        }

        if (errors.length > 0) {
          return res
            .status(400)
            .json({ message: "Some items could not be purchased", errors });
        }

        // Step 2: Save order to database
        const orderDetails = cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }));

        console.log("Order details (JSON):", JSON.stringify(orderDetails)); // ✅ DEBUG
        console.log("User ID:", userId); // ✅ DEBUG

        try {
          await db
            .promise()
            .query(
              "INSERT INTO orders (user_id, order_details) VALUES (?, ?)",
              [userId, JSON.stringify(orderDetails)]
            );
          console.log("✅ Order inserted into DB");
        } catch (error) {
          console.error("❌ Error inserting order into DB:", error); // ✅ DEBUG
        }

        // Step 3: Send email
        const orderDate = new Date(Date.now()).toLocaleString();
        const itemsList = cartItems
          .map((item) => `${item.name} (${item.price}) x${item.quantity}`)
          .join("\n");

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          service: "gmail",
          auth: {
            user: "subathrar2005@gmail.com",
            pass: "oufkctkysezfxyqq",
          },
        });

        await transporter.sendMail({
          from: "subathrar2005@gmail.com",
          to: email,
          subject: "Purchase Confirmation",
          text: `Thank you for your purchase!\n\nItems:\n${itemsList}\n\nTotal: ₹${totalAmount}\nDate: ${orderDate}`,
        });

        // Step 4: Clear cart
        await db
          .promise()
          .query("DELETE FROM cart_items WHERE user_id = ?", [userId]);

        res.json({
          success: true,
          message: "Purchase complete. Email sent and order recorded.",
        });
      } catch (err) {
        console.error("Checkout error:", err);
        res
          .status(500)
          .json({ message: "Checkout failed", error: err.message });
      }
    }
  );
});

module.exports = router;
