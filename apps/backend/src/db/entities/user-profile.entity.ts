import { Field, ID, ObjectType } from '@nestjs/graphql';
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
@Entity('user_profiles')
export class UserProfileEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'uuid', unique: true })
  public userId!: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user!: UserEntity;

  // Personal Information
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public firstName?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public middleName?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public lastName?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public displayName?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public preferredName?: string;

  // Demographics (optional, privacy-conscious)
  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  public dateOfBirth?: Date;

  // Contact
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  public phone?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  public phoneVerifiedAt?: Date;

  // Preferences
  @Field()
  @Column({ type: 'varchar', length: 50, default: 'America/Los_Angeles' })
  public timezone!: string;

  @Field()
  @Column({ type: 'varchar', length: 10, default: 'en-US' })
  public locale!: string;

  @Field()
  @Column({ type: 'varchar', length: 5, default: 'en' })
  public preferredLanguage!: string;

  // Profile
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  public avatarUrl?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  public bio?: string;

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
