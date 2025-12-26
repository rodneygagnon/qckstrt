import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@ObjectType()
@Entity('user_logins')
export class UserLoginEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'uuid', unique: true })
  public userId!: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user!: UserEntity;

  // Password authentication (optional - for legacy support)
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  public passwordHash?: string;

  // Login tracking
  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  public lastLoginAt?: Date;

  @Field(() => Int)
  @Column({ type: 'integer', default: 0 })
  public loginCount!: number;

  // Failed login tracking (for security)
  @Column({ type: 'integer', default: 0 })
  public failedLoginAttempts!: number;

  @Column({ type: 'timestamptz', nullable: true })
  public lockedUntil?: Date;

  @Field()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public createdAt!: Date;

  @Field()
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public updatedAt!: Date;
}
