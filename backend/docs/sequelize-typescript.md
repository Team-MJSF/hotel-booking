# Using Sequelize with TypeScript

This project uses Sequelize ORM with TypeScript. The configuration is set up to allow Sequelize CLI to work with TypeScript files.

## Configuration

The project uses a `.sequelizerc` file to configure Sequelize CLI to work with TypeScript. This file is located in the root of the backend directory and points Sequelize to the TypeScript configuration files.

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('config', 'config.ts'),
  'models-path': path.resolve('models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations')
};
```

## Running Sequelize CLI Commands

To run Sequelize CLI commands with TypeScript support, use the npm scripts defined in `package.json`:

```bash
# Create database
npm run db:create

# Run migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Undo all migrations
npm run migrate:undo:all

# Run all seeders
npm run db:seed:all

# Undo all seeders
npm run db:seed:undo:all
```

## Creating Models

When creating models, make sure to export them as default exports to work with the model loader:

```typescript
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

class MyModel extends Model {
  // Define your model attributes and methods here
}

MyModel.init({
  // Define your model schema here
}, {
  sequelize,
  tableName: 'my_table'
});

export default MyModel;
```

## Creating Migrations

Migrations should be created as CommonJS modules (`.cjs` files) to ensure compatibility with Sequelize CLI:

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Migration code here
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback code here
  }
};
```

## Creating Seeders

Seeders should also be created as CommonJS modules (`.cjs` files):

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeder code here
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback code here
  }
};
```