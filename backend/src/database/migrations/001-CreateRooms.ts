import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRooms1709913600001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the rooms table
    await queryRunner.createTable(
      new Table({
        name: 'rooms',
        columns: [
          {
            name: 'room_id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'room_number',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'room_type',
            type: 'varchar', // SQLite doesn't support ENUM, use CHECK constraint instead
            length: '20',
            default: "'standard'",
          },
          {
            name: 'price_per_night',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'max_guests',
            type: 'integer',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'availability_status',
            type: 'varchar', // SQLite doesn't support ENUM, use CHECK constraint instead
            length: '20',
            default: "'available'",
          },
          {
            name: 'amenities',
            type: 'text', // Store JSON as text in SQLite
            isNullable: true,
          },
          {
            name: 'photos',
            type: 'text', // Store JSON as text in SQLite
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add trigger for updated_at 
    await queryRunner.query(
      `CREATE TRIGGER update_rooms_timestamp 
       AFTER UPDATE ON rooms 
       FOR EACH ROW 
       BEGIN 
         UPDATE rooms SET updated_at = CURRENT_TIMESTAMP WHERE room_id = OLD.room_id; 
       END`
    );

    // Add CHECK constraints for room_type using triggers
    await queryRunner.query(
      `CREATE TRIGGER check_room_type
       BEFORE INSERT ON rooms
       FOR EACH ROW
       BEGIN
         SELECT CASE
           WHEN NEW.room_type NOT IN ('standard', 'executive', 'family', 'deluxe', 'premium') THEN
             RAISE(ABORT, 'Invalid room type')
         END;
       END`
    );

    await queryRunner.query(
      `CREATE TRIGGER check_room_type_update
       BEFORE UPDATE ON rooms
       FOR EACH ROW
       WHEN NEW.room_type IS NOT OLD.room_type
       BEGIN
         SELECT CASE
           WHEN NEW.room_type NOT IN ('standard', 'executive', 'family', 'deluxe', 'premium') THEN
             RAISE(ABORT, 'Invalid room type')
         END;
       END`
    );

    // Add CHECK constraints for availability_status using triggers
    await queryRunner.query(
      `CREATE TRIGGER check_room_availability
       BEFORE INSERT ON rooms
       FOR EACH ROW
       BEGIN
         SELECT CASE
           WHEN NEW.availability_status NOT IN ('available', 'occupied', 'maintenance', 'cleaning') THEN
             RAISE(ABORT, 'Invalid availability status')
         END;
       END`
    );

    await queryRunner.query(
      `CREATE TRIGGER check_room_availability_update
       BEFORE UPDATE ON rooms
       FOR EACH ROW
       WHEN NEW.availability_status IS NOT OLD.availability_status
       BEGIN
         SELECT CASE
           WHEN NEW.availability_status NOT IN ('available', 'occupied', 'maintenance', 'cleaning') THEN
             RAISE(ABORT, 'Invalid availability status')
         END;
       END`
    );

    // Create indexes
    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_TYPE',
        columnNames: ['room_type'],
      }),
    );

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_PRICE',
        columnNames: ['price_per_night'],
      }),
    );

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_MAX_GUESTS',
        columnNames: ['max_guests'],
      }),
    );

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_AVAILABILITY',
        columnNames: ['availability_status'],
      }),
    );

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_TYPE_PRICE',
        columnNames: ['room_type', 'price_per_night'],
      }),
    );

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_TYPE_AVAILABILITY',
        columnNames: ['room_type', 'availability_status'],
      }),
    );

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_NUMBER',
        columnNames: ['room_number'],
      }),
    );

    // FTS5 virtual table for full-text search
    await queryRunner.query(
      `CREATE VIRTUAL TABLE IF NOT EXISTS rooms_fts USING fts5(
        description, 
        content='rooms',
        content_rowid='room_id'
      )`
    );

    // Create triggers to keep FTS table in sync
    await queryRunner.query(
      `CREATE TRIGGER IF NOT EXISTS rooms_ai AFTER INSERT ON rooms BEGIN
        INSERT INTO rooms_fts(rowid, description) VALUES (new.room_id, new.description);
       END`
    );

    await queryRunner.query(
      `CREATE TRIGGER IF NOT EXISTS rooms_ad AFTER DELETE ON rooms BEGIN
        INSERT INTO rooms_fts(rooms_fts, rowid, description) VALUES('delete', old.room_id, old.description);
       END`
    );

    await queryRunner.query(
      `CREATE TRIGGER IF NOT EXISTS rooms_au AFTER UPDATE ON rooms BEGIN
        INSERT INTO rooms_fts(rooms_fts, rowid, description) VALUES('delete', old.room_id, old.description);
        INSERT INTO rooms_fts(rowid, description) VALUES (new.room_id, new.description);
       END`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the FTS virtual table and its triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS rooms_ai`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS rooms_ad`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS rooms_au`);
    await queryRunner.query(`DROP TABLE IF EXISTS rooms_fts`);

    // Drop validation triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_room_type`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_room_type_update`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_room_availability`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_room_availability_update`);

    // Drop the update timestamp trigger
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_rooms_timestamp`);

    // Drop the rooms table (will cascade to drop all indexes and constraints)
    await queryRunner.dropTable('rooms');
  }
}
