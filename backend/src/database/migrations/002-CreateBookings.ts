import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateBookings1709913600002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          {
            name: 'booking_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'room_id',
            type: 'int',
          },
          {
            name: 'check_in_date',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'check_out_date',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'number_of_guests',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'special_requests',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: `'pending'`,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for bookings
    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_BOOKINGS_DATES',
        columnNames: ['check_in_date', 'check_out_date'],
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
        name: 'IDX_BOOKINGS_USER_STATUS',
        columnNames: ['user_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_BOOKINGS_ROOM_STATUS',
        columnNames: ['room_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_BOOKINGS_ACTIVE',
        columnNames: ['status'],
      }),
    );

    // Add foreign key constraints
    await queryRunner.query(
      'ALTER TABLE `bookings` ADD CONSTRAINT `FK_9154ba42728899ce737b81fb694` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `bookings` ADD CONSTRAINT `FK_9643fa98c94e908f6ea51f0c559` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`) ON DELETE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('bookings');
    if (table) {
      const indices = table.indices.filter(
        (index) => [
          'IDX_BOOKINGS_DATES',
          'IDX_BOOKINGS_STATUS',
          'IDX_BOOKINGS_USER_STATUS',
          'IDX_BOOKINGS_ROOM_STATUS',
          'IDX_BOOKINGS_ACTIVE'
        ].includes(index.name),
      );
      await Promise.all(indices.map((index) => queryRunner.dropIndex('bookings', index)));
    }
    await queryRunner.query(
      'ALTER TABLE `bookings` DROP FOREIGN KEY `FK_9643fa98c94e908f6ea51f0c559`',
    );
    await queryRunner.query(
      'ALTER TABLE `bookings` DROP FOREIGN KEY `FK_9154ba42728899ce737b81fb694`',
    );
    await queryRunner.dropTable('bookings');
  }
}
