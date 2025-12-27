import {
  Field,
  ID,
  ObjectType,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
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

export enum AddressType {
  RESIDENTIAL = 'residential',
  MAILING = 'mailing',
  BUSINESS = 'business',
  VOTING = 'voting', // Important for civic applications
}

registerEnumType(AddressType, {
  name: 'AddressType',
  description: 'The type of address',
});

@ObjectType()
@Entity('user_addresses')
@Index(['userId', 'addressType'])
@Index(['userId', 'isPrimary'])
export class UserAddressEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'uuid' })
  @Index()
  public userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user!: UserEntity;

  // Address classification
  @Field(() => AddressType)
  @Column({ type: 'enum', enum: AddressType, default: AddressType.RESIDENTIAL })
  public addressType!: AddressType;

  @Field()
  @Column({ type: 'boolean', default: false })
  public isPrimary!: boolean;

  // Standard address fields
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public label?: string; // 'Home', 'Work', 'Vacation home'

  @Field()
  @Column({ type: 'varchar', length: 255 })
  public addressLine1!: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public addressLine2?: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  public city!: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  public state!: string;

  @Field()
  @Column({ type: 'varchar', length: 20 })
  public postalCode!: string;

  @Field()
  @Column({ type: 'varchar', length: 2, default: 'US' })
  public country!: string; // ISO 3166-1 alpha-2

  // Geocoding data (populated via external service)
  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  public latitude?: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  public longitude?: number;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  public formattedAddress?: string; // Normalized from geocoding service

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public placeId?: string; // Google Places ID or similar

  @Column({ type: 'timestamptz', nullable: true })
  public geocodedAt?: Date;

  // Civic boundary data (Critical for civic verticals)
  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  public congressionalDistrict?: string; // e.g., 'CA-12'

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  public stateSenatorialDistrict?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  public stateAssemblyDistrict?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public county?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public municipality?: string; // City/town for local elections

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public schoolDistrict?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public precinctId?: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  public pollingPlace?: string;

  @Column({ type: 'timestamptz', nullable: true })
  public civicDataUpdatedAt?: Date;

  // Verification status
  @Field()
  @Column({ type: 'boolean', default: false })
  public isVerified!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  public verifiedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  public verificationMethod?: string; // 'usps', 'geocoding', 'manual'

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
