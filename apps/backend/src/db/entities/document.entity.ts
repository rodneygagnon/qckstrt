import { DocumentStatus } from 'src/common/enums/document.status.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('documents')
export class DocumentEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar', length: 255 })
  public location!: string;

  @Column({ type: 'varchar', length: 255 })
  public userId!: string;

  @Column({ type: 'varchar', length: 255 })
  public key!: string;

  @Column({ type: 'int' })
  public size!: number;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  public checksum!: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PROCESSINGNPENDING,
  })
  public status!: DocumentStatus;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    select: true,
  })
  public createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    select: true,
  })
  public updatedAt!: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    select: false,
  })
  public deletedAt?: Date;
}
