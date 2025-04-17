import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBookings1709913600002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          {
            name: 'booking_id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'integer',
          },
          {
            name: 'room_id',
            type: 'integer',
          },
          {
            name: 'check_in_date',
            type: 'datetime',
          },
          {
            name: 'check_out_date',
            type: 'datetime',
          },
          {
            name: 'number_of_guests',
            type: 'integer',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
          },
          {
            name: 'special_requests',
            type: 'text',
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
      `CREATE TRIGGER update_bookings_timestamp 
       AFTER UPDATE ON bookings 
       FOR EACH ROW 
       BEGIN 
         UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE booking_id = OLD.booking_id; 
       END`
    );

    // Add CHECK constraints for status using triggers
    await queryRunner.query(
      `CREATE TRIGGER check_booking_status
       BEFORE INSERT ON bookings
       FOR EACH ROW
       BEGIN
         SELECT CASE
           WHEN NEW.status NOT IN ('pending', 'confirmed', 'cancelled', 'completed') THEN
             RAISE(ABORT, 'Invalid booking status')
         END;
       END`
    );

    await queryRunner.query(
      `CREATE TRIGGER check_booking_status_update
       BEFORE UPDATE ON bookings
       FOR EACH ROW
       WHEN NEW.status IS NOT OLD.status
       BEGIN
         SELECT CASE
           WHEN NEW.status NOT IN ('pending', 'confirmed', 'cancelled', 'completed') THEN
             RAISE(ABORT, 'Invalid booking status')
         END;
       END`
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({
        name: 'FK_BOOKINGS_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['user_id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({
        name: 'FK_BOOKINGS_ROOM',
        columnNames: ['room_id'],
        referencedTableName: 'rooms',
        referencedColumnNames: ['room_id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_BOOKINGS_USER',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_BOOKINGS_ROOM',
        columnNames: ['room_id'],
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_BOOKINGS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_BOOKINGS_DATES',
        columnNames: ['check_in_date', 'check_out_date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_bookings_timestamp`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_booking_status`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_booking_status_update`);

    // Drop the table (will also drop foreign keys, indexes, and constraints)
    await queryRunner.dropTable('bookings');
  }
}
