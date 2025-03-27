import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePayments1709913600003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'Payments',
        columns: [
          {
            name: 'paymentId',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'bookingId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
            default: '\'Pending\'',
          },
          {
            name: 'paymentMethod',
            type: 'enum',
            enum: ['Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal'],
          },
          {
            name: 'transactionId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'paymentDetails',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'refundReason',
            type: 'varchar',
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

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'Payments',
      new TableForeignKey({
        columnNames: ['bookingId'],
        referencedColumnNames: ['bookingId'],
        referencedTableName: 'Bookings',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('Payments');
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('bookingId') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('Payments', foreignKey);
      }
    }
    await queryRunner.dropTable('Payments');
  }
}
