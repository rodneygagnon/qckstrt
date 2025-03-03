import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity('embeddings')
export class EmbeddingEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar' })
  public userId!: string;

  @Column({ type: 'varchar' })
  public content!: string;

  @Column({ type: 'text' }) // should this be tsvector?
  public embedding!: string;

  @Column({ type: 'jsonb' })
  public metadata!: { source: string };
}
