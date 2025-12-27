import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  DAILY_DIGEST = 'daily_digest',
  WEEKLY_DIGEST = 'weekly_digest',
  NEVER = 'never',
}

registerEnumType(NotificationFrequency, {
  name: 'NotificationFrequency',
  description: 'How often to receive notifications',
});

@ObjectType()
@Entity('notification_preferences')
export class NotificationPreferenceEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'uuid', unique: true })
  @Index()
  public userId!: string;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user!: UserEntity;

  // Email Notifications
  @Field()
  @Column({ type: 'boolean', default: true })
  public emailEnabled!: boolean;

  @Field()
  @Column({ type: 'boolean', default: true })
  public emailProductUpdates!: boolean;

  @Field()
  @Column({ type: 'boolean', default: true })
  public emailSecurityAlerts!: boolean;

  @Field()
  @Column({ type: 'boolean', default: false })
  public emailMarketing!: boolean;

  @Field(() => NotificationFrequency)
  @Column({
    type: 'enum',
    enum: NotificationFrequency,
    default: NotificationFrequency.IMMEDIATE,
  })
  public emailFrequency!: NotificationFrequency;

  // Push Notifications
  @Field()
  @Column({ type: 'boolean', default: true })
  public pushEnabled!: boolean;

  @Field()
  @Column({ type: 'boolean', default: true })
  public pushProductUpdates!: boolean;

  @Field()
  @Column({ type: 'boolean', default: true })
  public pushSecurityAlerts!: boolean;

  @Field()
  @Column({ type: 'boolean', default: false })
  public pushMarketing!: boolean;

  // SMS Notifications
  @Field()
  @Column({ type: 'boolean', default: false })
  public smsEnabled!: boolean;

  @Field()
  @Column({ type: 'boolean', default: true })
  public smsSecurityAlerts!: boolean;

  @Field()
  @Column({ type: 'boolean', default: false })
  public smsMarketing!: boolean;

  // Civic-specific notifications (for civic verticals)
  @Field()
  @Column({ type: 'boolean', default: true })
  public civicElectionReminders!: boolean;

  @Field()
  @Column({ type: 'boolean', default: true })
  public civicVoterDeadlines!: boolean;

  @Field()
  @Column({ type: 'boolean', default: true })
  public civicBallotUpdates!: boolean;

  @Field()
  @Column({ type: 'boolean', default: true })
  public civicLocalNews!: boolean;

  @Field()
  @Column({ type: 'boolean', default: true })
  public civicRepresentativeUpdates!: boolean;

  @Field(() => NotificationFrequency)
  @Column({
    type: 'enum',
    enum: NotificationFrequency,
    default: NotificationFrequency.DAILY_DIGEST,
  })
  public civicFrequency!: NotificationFrequency;

  // Quiet hours
  @Field()
  @Column({ type: 'boolean', default: false })
  public quietHoursEnabled!: boolean;

  @Field({ nullable: true })
  @Column({ type: 'time', nullable: true })
  public quietHoursStart?: string; // e.g., '22:00'

  @Field({ nullable: true })
  @Column({ type: 'time', nullable: true })
  public quietHoursEnd?: string; // e.g., '08:00'

  // Unsubscribe tracking
  @Column({ type: 'timestamptz', nullable: true })
  public unsubscribedAllAt?: Date;

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
