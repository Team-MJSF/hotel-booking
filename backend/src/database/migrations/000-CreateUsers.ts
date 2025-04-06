import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsers1709913600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'user_id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'role',
            type: 'varchar',
            length: '10',
            default: "'user'",
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'token_version',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
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
      `CREATE TRIGGER update_users_timestamp 
       AFTER UPDATE ON users 
       FOR EACH ROW 
       BEGIN 
         UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = OLD.user_id; 
       END`
    );

    // Add CHECK constraints directly using raw query since SQLite doesn't support ALTER TABLE ADD CONSTRAINT
    await queryRunner.query(
      `CREATE TRIGGER check_user_role
       BEFORE INSERT ON users
       FOR EACH ROW
       BEGIN
         SELECT CASE
           WHEN NEW.role NOT IN ('admin', 'user', 'staff') THEN
             RAISE(ABORT, 'Invalid role value')
         END;
       END`
    );

    await queryRunner.query(
      `CREATE TRIGGER check_user_role_update
       BEFORE UPDATE ON users
       FOR EACH ROW
       WHEN NEW.role IS NOT OLD.role
       BEGIN
         SELECT CASE
           WHEN NEW.role NOT IN ('admin', 'user', 'staff') THEN
             RAISE(ABORT, 'Invalid role value')
         END;
       END`
    );

    // Create index on email
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USERS_EMAIL',
        columnNames: ['email'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_timestamp`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_user_role`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_user_role_update`);

    // Drop the table (will also drop indexes and constraints)
    await queryRunner.dropTable('users');
  }
}

        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_users_timestamp`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_user_role`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS check_user_role_update`);

    // Drop the table (will also drop indexes and constraints)
    await queryRunner.dropTable('users');
  }
}
