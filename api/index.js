// api/index.js

// Make sure dotenv is configured to find the .env file at the root
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('../backend/routes/api');

const app = express();

// Vercel applies its own cors headers, but this is good practice
app.use(cors());
app.use(express.json());

// All routes are defined in the original api.js, mounted under /api
// When a request like /api/agents/chat hits Vercel, it runs this file.
// The express app then takes over. The router in apiRoutes is already configured
// to handle paths starting with `/agents/chat`, so it should match correctly.
app.use('/api', apiRoutes);

// Export the Express app for Vercel
module.exports = app;
