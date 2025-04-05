import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePayments1709913600003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'payment_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'booking_id',
            type: 'int',
            isUnique: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
          },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash'],
            default: `'credit_card'`,
          },
          {
            name: 'transaction_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: `'pending'`,
          },
          {
            name: 'refund_reason',
            type: 'varchar',
            length: '255',
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

    // Create indexes for payments
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_BOOKING',
        columnNames: ['booking_id'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_STATUS',
        columnNames: ['status'],
      }),
    );

    // Add foreign key constraint
    await queryRunner.query(
      'ALTER TABLE `payments` ADD CONSTRAINT `FK_231b42ff1bd554331c084a3617e` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('payments');
    if (table) {
      const indices = table.indices.filter(index =>
        ['IDX_PAYMENTS_BOOKING', 'IDX_PAYMENTS_STATUS'].includes(index.name),
      );
      await Promise.all(indices.map(index => queryRunner.dropIndex('payments', index)));
    }
    await queryRunner.query(
      'ALTER TABLE `payments` DROP FOREIGN KEY `FK_231b42ff1bd554331c084a3617e`',
    );
    await queryRunner.dropTable('payments');
  }
}
