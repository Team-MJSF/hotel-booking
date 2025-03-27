import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRooms1709913600001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'Rooms',
        columns: [
          {
            name: 'roomId',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'roomNumber',
            type: 'varchar',
          },
          {
            name: 'roomType',
            type: 'enum',
            enum: ['Single', 'Double', 'Suite'],
            default: '\'Single\'',
          },
          {
            name: 'pricePerNight',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'maxGuests',
            type: 'int',
          },
          {
            name: 'availabilityStatus',
            type: 'enum',
            enum: ['Available', 'Occupied', 'Maintenance', 'Cleaning'],
            default: '\'available\'',
          },
          {
            name: 'amenities',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('Rooms');
  }
}
