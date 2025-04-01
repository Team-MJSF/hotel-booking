import { MigrationInterface, QueryRunner, Table } from 'typeorm';

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
        ],
      }),
      true,
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
    await queryRunner.query(
      'ALTER TABLE `bookings` DROP FOREIGN KEY `FK_9643fa98c94e908f6ea51f0c559`',
    );
    await queryRunner.query(
      'ALTER TABLE `bookings` DROP FOREIGN KEY `FK_9154ba42728899ce737b81fb694`',
    );
    await queryRunner.dropTable('bookings');
  }
}
