// This file helps Sequelize CLI work with TypeScript
require('ts-node/register');

// Import the .sequelizerc configuration
const path = require('path');
const config = require('./.sequelizerc');

// Export the configuration for Sequelize CLI
module.exports = config;