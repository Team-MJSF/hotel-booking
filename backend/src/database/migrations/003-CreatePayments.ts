import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePayments1709913600003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'payment_id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'booking_id',
            type: 'integer',
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
            default: "'USD'",
          },
          {
            name: 'payment_method',
            type: 'varchar',
            length: '20',
            default: "'credit_card'",
          },
          {
            name: 'transaction_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
          },
          {
            name: 'refund_reason',
            type: 'varchar',
            length: '255',
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

    // Add trigger for updated_at timestamp
    await queryRunner.query(
      `CREATE TRIGGER update_payments_timestamp 
       AFTER UPDATE ON payments 
       FOR EACH ROW 
       BEGIN 
         UPDATE payments SET updated_at = CURRENT_TIMESTAMP WHERE payment_id = OLD.payment_id; 
       END`
    );

    // Add validation triggers for currency
    await queryRunner.query(
      `CREATE TRIGGER check_payment_currency
       BEFORE INSERT ON payments
       FOR EACH ROW
       BEGIN
         SELECT CASE
           WHEN NEW.currency NOT IN ('USD', 'EUR') THEN
             RAISE(ABORT, 'Invalid currency value')
         END;
       END`
    );

    await queryRunner.query(
      `CREATE TRIGGER check_payment_currency_update
       BEFORE UPDATE ON payments
       FOR EACH ROW
       WHEN NEW.currency IS NOT OLD.currency
       BEGIN
         SELECT CASE
           WHEN NEW.currency NOT IN ('USD', 'EUR') THEN
             RAISE(ABORT, 'Invalid currency value')
         END;
       END`
    );

    // Add validation triggers for payment_method
    await queryRunner.query(
      `CREATE TRIGGER check_payment_method
       BEFORE INSERT ON payments
       FOR EACH ROW
       BEGIN
         SELECT CASE
           WHEN NEW.payment_method NOT IN ('credit_card', 'debit_card', 'bank_transfer', 'cash') THEN
             RAISE(ABORT, 'Invalid payment method')
         END;
       END`
    );

    await queryRunner.query(
      `CREATE TRIGGER check_payment_method_update
       BEFORE UPDATE ON payments
       FOR EACH ROW
       WHEN NEW.payment_method IS NOT OLD.payment_method
       BEGIN
         SELECT CASE
           WHEN NEW.payment_method NOT IN ('credit_card', 'debit_card', 'bank_transfer', 'cash') THEN
             RAISE(ABORT, 'Invalid payment method')
         END;
       END`
    );

    // Add validation triggers for status
    await queryRunner.query(
      `CREATE TRIGGER check_payment_status
       BEFORE INSERT ON payments
       FOR EACH ROW
       BEGIN
         SELECT CASE
           WHEN NEW.status NOT IN ('pending', 'completed', 'failed', 'refunded') THEN
             RAISE(ABORT, 'Invalid payment status')
         END;
       END`
    );

    await queryRunner.query(
      `CREATE TRIGGER check_payment_status_update
       BEFORE UPDATE ON payments
       FOR EACH ROW
       WHEN NEW.status IS NOT OLD.status
       BEGIN
         SELECT CASE
           WHEN NEW.status NOT IN ('pending', 'completed', 'failed', 'refunded') THEN
             RAISE(ABORT, 'Invalid payment status')
         END;
       END`
    );

    // Create foreign key for booking
    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        name: 'FK_PAYMENTS_BOOKING',
        columnNames: ['booking_id'],
        referencedTableName: 'bookings',
        referencedColumnNames: ['booking_id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_BOOKING',
        columnNames: ['booking_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_STATUS',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_payments_timestamp`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_payment_currency`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_payment_currency_update`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_payment_method`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_payment_method_update`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_payment_status`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_payment_status_update`);

    // Drop the table (will also drop foreign keys and indexes)
    await queryRunner.dropTable('payments');
  }
}
