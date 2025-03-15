# Seeders

This directory contains database seed files for your Sequelize models.

## Creating a Seeder

To create a new seeder file, run:

```bash
npx sequelize-cli seed:generate --name seed-name
```

## Running Seeders

To run all seeders:

```bash
npx sequelize-cli db:seed:all
```

To run a specific seeder:

```bash
npx sequelize-cli db:seed --seed name-of-seed-file
```

## Undoing Seeders

To undo the most recent seeder:

```bash
npx sequelize-cli db:seed:undo
```

To undo a specific seeder:

```bash
npx sequelize-cli db:seed:undo --seed name-of-seed-file
```

To undo all seeders:

```bash
npx sequelize-cli db:seed:undo:all
```