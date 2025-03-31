import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRooms1709913600001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rooms',
        columns: [
          {
            name: 'room_id',
            type: 'int',
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
            type: 'enum',
            enum: ['single', 'double', 'suite', 'deluxe'],
            default: "'single'",
          },
          {
            name: 'price_per_night',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'max_guests',
            type: 'int',
          },
          {
            name: 'availability_status',
            type: 'enum',
            enum: ['available', 'occupied', 'maintenance', 'cleaning'],
            default: "'available'",
          },
          {
            name: 'amenities',
            type: 'json',
            isNullable: true,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rooms');
  }
}
