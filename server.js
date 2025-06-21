require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./configs/db');
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MySQL
db.connect()
  .then(() => console.log('Connected to MySQL database'))
  .catch(err => console.error('Database connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Node.js MySQL OpenFGA API' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
  process.exit(1);
});