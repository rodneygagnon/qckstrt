import { CreateUserDto } from './users/src/domains/user/dto/create-user.dto';
import { UpdateUserDto } from './users/src/domains/user/dto/update-user.dto';
import { RegisterUserDto } from './users/src/domains/auth/dto/register-user.dto';
import { LoginUserDto } from './users/src/domains/auth/dto/login-user.dto';
import { ChangePasswordDto } from './users/src/domains/auth/dto/change-password.dto';
import { ConfirmForgotPasswordDto } from './users/src/domains/auth/dto/confirm-forgot-password.dto';

// User Module Test Data
export const users = [
  {
    id: '1',
    email: 'user.one@gmail.com',
    firstName: 'user',
    lastName: 'one',
    created: new Date(),
    updated: new Date(),
  },
  {
    id: '2',
    email: 'user.two@gmail.com',
    firstName: 'user',
    lastName: 'two',
    created: new Date(),
    updated: new Date(),
  },
];

export const createUserDto: CreateUserDto = {
  email: users[0].email,
  username: users[0].email,
  password: 'MyP2$$w0rd!',
  firstName: users[0].firstName,
  lastName: users[0].lastName,
};

export const updateUserDto: UpdateUserDto = {
  email: users[0].email,
  username: users[0].email,
  firstName: users[0].firstName,
  lastName: users[0].lastName,
};

export const loginUserDto: LoginUserDto = {
  email: users[0].email,
  password: 'MyP2$$w0rd!',
};

export const registerUserDto: RegisterUserDto = {
  email: users[0].email,
  username: users[0].email,
  password: 'MyP2$$w0rd!',
  department: 'development',
  clearance: 'confidential',
  admin: true,
  confirm: true,
};

export const changePasswordDto: ChangePasswordDto = {
  accessToken: 'MyAccessToken',
  newPassword: 'MyCurrentP2$$w0rd!',
  currentPassword: 'MyCurrentP2$$w0rd!',
};

export const confirmForgotPasswordDto: ConfirmForgotPasswordDto = {
  email: users[0].email,
  confirmationCode: 'MyConfirmationCode',
  password: 'MyNewP2$$w0rd!',
};

export const files = [
  {
    userId: 'a',
    filename: 'file1-a.pdf',
    size: 12345,
    lastModified: new Date(),
  },
  {
    userId: 'a',
    filename: 'file2-b.pdf',
    size: 54321,
    lastModified: new Date(),
  },
];

describe('User Data', () => {
  it('should define all users', async () => {
    expect(users).toBeDefined();
  });
});
