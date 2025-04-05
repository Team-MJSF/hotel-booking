import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

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
            default: `'single'`,
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
            name: 'description',
            type: 'text',
          },
          {
            name: 'availability_status',
            type: 'enum',
            enum: ['available', 'occupied', 'maintenance', 'cleaning'],
            default: `'available'`,
          },
          {
            name: 'amenities',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'photos',
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
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for rooms
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

    await queryRunner.createIndex(
      'rooms',
      new TableIndex({
        name: 'IDX_ROOMS_DESCRIPTION',
        columnNames: ['description'],
        isFulltext: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('rooms');
    if (table) {
      const indices = table.indices.filter(index =>
        [
          'IDX_ROOMS_TYPE',
          'IDX_ROOMS_PRICE',
          'IDX_ROOMS_MAX_GUESTS',
          'IDX_ROOMS_AVAILABILITY',
          'IDX_ROOMS_TYPE_PRICE',
          'IDX_ROOMS_TYPE_AVAILABILITY',
          'IDX_ROOMS_NUMBER',
          'IDX_ROOMS_DESCRIPTION',
        ].includes(index.name),
      );
      await Promise.all(indices.map(index => queryRunner.dropIndex('rooms', index)));
    }
    await queryRunner.dropTable('rooms');
  }
}
