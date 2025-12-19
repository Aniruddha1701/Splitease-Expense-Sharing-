// Vercel Serverless API Handler
// Properly wraps Express app for Vercel

require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
const app = require('../server/index.js');

// Export for Vercel
module.exports = app;
