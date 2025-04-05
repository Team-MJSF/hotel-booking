import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'The date when the record was created' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'The date when the record was last updated' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @ApiProperty({ description: 'The date when the record was soft deleted', required: false })
  deletedAt?: Date;
}
