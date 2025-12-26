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
@Entity('passkey_credentials')
export class PasskeyCredentialEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'uuid' })
  @Index()
  public userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user!: UserEntity;

  // WebAuthn credential ID (base64url encoded)
  @Column({ type: 'text', unique: true })
  @Index()
  public credentialId!: string;

  // Public key in COSE format (base64url encoded)
  @Column({ type: 'text' })
  public publicKey!: string;

  // Signature counter for replay attack prevention
  @Column({ type: 'bigint', default: 0 })
  public counter!: number;

  // AAGUID of the authenticator
  @Column({ type: 'varchar', length: 36, nullable: true })
  public aaguid?: string;

  // Device/authenticator type (platform, cross-platform)
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  public deviceType?: string;

  // Whether the credential is backed up (synced passkey)
  @Column({ type: 'boolean', default: false })
  public backedUp!: boolean;

  // Human-readable name for the passkey
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public friendlyName?: string;

  // Transports supported (usb, ble, nfc, internal)
  @Column({ type: 'simple-array', nullable: true })
  public transports?: string[];

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
  public lastUsedAt!: Date;
}
