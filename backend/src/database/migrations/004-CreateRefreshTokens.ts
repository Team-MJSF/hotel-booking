import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRefreshTokens1709913600004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
            default: null,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_REFRESH_TOKEN_USER',
            columnNames: ['user_id'],
          },
          {
            name: 'IDX_REFRESH_TOKEN_TOKEN',
            columnNames: ['token'],
            isUnique: true,
          },
          {
            name: 'IDX_REFRESH_TOKEN_ACTIVE',
            columnNames: ['is_active'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'refresh_tokens',
      new TableForeignKey({
        name: 'FK_REFRESH_TOKENS_USER',
        columnNames: ['user_id'],
        referencedColumnNames: ['user_id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('refresh_tokens');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.name === 'FK_REFRESH_TOKENS_USER',
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('refresh_tokens', foreignKey);
      }
    }
    await queryRunner.dropTable('refresh_tokens');
  }
} 