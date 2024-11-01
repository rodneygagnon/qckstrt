import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Richard Roe' },
  ];

  findAll(): User[] {
    return this.users;
  }

  findById(id: number): User {
    return this.users.find((user) => user.id === Number(id)) || ({} as User);
  }
}
