import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { User } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import evaluateDBError from 'src/db/db.errors';
import { AuthService } from '../auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name, { timestamp: true });

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
    private configService: ConfigService,
  ) {}

  /**
   * Creates a user
   *
   * @param {CreateUserDto} createUserDto username, email, and password. Username and email must be
   * unique, will throw an email with a description if either are duplicates
   * @returns {Promise<User>} or throws an error
   * @memberof UsersService
   */
  async create(createUserDto: CreateUserDto): Promise<User | null> {
    const { password, ...rest } = createUserDto;

    const userEntity = this.userRepo.create();

    const saveEntity = {
      ...userEntity,
      ...rest,
    };

    let user: User | null = null;
    try {
      user = await this.userRepo.save(saveEntity);
      await this.authService.registerUser({
        email: createUserDto.email,
        username: createUserDto.username,
        password,
      });
    } catch (error) {
      if (user === null) {
        /** We hit a userRepo Error, just report back */
        const dbError = evaluateDBError(error);

        this.logger.warn(
          `userRepo error creating (${JSON.stringify(createUserDto)}): ${dbError.message}`,
        );

        throw dbError;
      } else {
        /** We hit an authService Error, clean up the user db entry */
        this.logger.warn(
          `authService error registering (${JSON.stringify(createUserDto)}): ${error.message}`,
        );

        this.userRepo
          .createQueryBuilder()
          .delete()
          .from(User)
          .where('id = :id', { id: user.id })
          .execute()
          .catch((error) => {
            this.logger.error(
              `Error deleting user after authService error: ${error.message}`,
            );
          });

        throw error;
      }
    }

    return user;
  }

  findAll(): Promise<User[] | null> {
    return this.userRepo.find({});
  }

  findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async update(
    id: string,
    user: Partial<User> | UpdateUserDto,
  ): Promise<boolean> {
    try {
      await this.userRepo.update({ id }, user);
    } catch (error) {
      const dbError = evaluateDBError(error);

      this.logger.warn(
        `userRepo error updating (${JSON.stringify(user)}): ${dbError.message}`,
      );

      throw dbError;
    }

    return Promise.resolve(true);
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (user === null) {
      return Promise.resolve(false);
    }

    try {
      await this.authService.deleteUser(user.email);
      await this.userRepo.delete({ id: user.id });
    } catch (error) {
      this.logger.warn(
        `userRepo error deleting (${JSON.stringify(user)}): `,
        error,
      );

      throw error;
    }

    return Promise.resolve(true);
  }
}
