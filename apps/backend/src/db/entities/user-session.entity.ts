import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@ObjectType()
@Entity('user_sessions')
@Index(['userId', 'isActive'])
@Index(['expiresAt'])
export class UserSessionEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'uuid' })
  @Index()
  public userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user!: UserEntity;

  // Session identification
  @Column({ type: 'varchar', length: 255, unique: true })
  public sessionToken!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public refreshToken?: string;

  // Device information
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public deviceType?: string; // 'desktop', 'mobile', 'tablet'

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public deviceName?: string; // 'MacBook Pro', 'iPhone 15'

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public browser?: string; // 'Chrome 120', 'Safari 17'

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public operatingSystem?: string; // 'macOS 14', 'iOS 17'

  // Location information
  @Column({ type: 'inet', nullable: true })
  public ipAddress?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public city?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public region?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 2, nullable: true })
  public country?: string; // ISO 3166-1 alpha-2

  // Session status
  @Field()
  @Column({ type: 'boolean', default: true })
  public isActive!: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  public lastActivityAt?: Date;

  @Field()
  @Column({ type: 'timestamptz' })
  public expiresAt!: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  public revokedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  public revokedReason?: string; // 'user_logout', 'password_change', 'admin_revoke', 'expired'

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
