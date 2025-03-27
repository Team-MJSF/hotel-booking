import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBookings1709913600002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'Bookings',
        columns: [
          {
            name: 'bookingId',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'roomId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'checkInDate',
            type: 'date',
          },
          {
            name: 'checkOutDate',
            type: 'date',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['Pending', 'Confirmed', 'Cancelled'],
            default: '\'Pending\'',
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

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'Bookings',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['userId'],
        referencedTableName: 'Users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'Bookings',
      new TableForeignKey({
        columnNames: ['roomId'],
        referencedColumnNames: ['roomId'],
        referencedTableName: 'Rooms',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('Bookings');
    if (table) {
      const foreignKeys = table.foreignKeys.filter(
        (fk) => fk.columnNames.indexOf('userId') !== -1 || fk.columnNames.indexOf('roomId') !== -1,
      );
      await Promise.all(
        foreignKeys.map((foreignKey) => queryRunner.dropForeignKey('Bookings', foreignKey)),
      );
    }
    await queryRunner.dropTable('Bookings');
  }
}
