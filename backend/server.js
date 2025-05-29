const express = require('express');
const bodyParser = require('body-parser');
const cors= require('cors');


const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
const cartRoutes = require('./routes/cart');
app.use('/api/cart',cartRoutes);
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = 5001;
app.listen(PORT, () => {
console.log(`Server is running at: http://localhost:${PORT}`);
});

