import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getGreeting(): string {
    return 'Welcome to the Organization App Service!!!';
  }
}
