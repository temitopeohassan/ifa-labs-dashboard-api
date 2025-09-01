const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Debug server is running',
    timestamp: new Date().toISOString()
  });
});

// Test dashboard route
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard API debug route is working',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Test auth route
app.get('/api/auth', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API debug route is working',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Health check is working',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔧 Debug server running on port ${PORT}`);
  console.log(`📊 Test dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`🔐 Test auth: http://localhost:${PORT}/api/auth`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
