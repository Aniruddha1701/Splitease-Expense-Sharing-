// Vercel Serverless Function Entry Point
// This wraps the Express app for Vercel's serverless environment

const app = require('../server/index.js');

// Export the Express app as a serverless function
module.exports = (req, res) => {
    // Handle the request with Express
    return app(req, res);
};
