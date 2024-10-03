import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  private readonly uniqIdentifier: string;
  constructor() {
    if (!this.uniqIdentifier) {
      this.uniqIdentifier = uuidv4();
    }
    console.log(`${this.constructor.name} initialized - ${this.uniqIdentifier}`);
  }

  talk() {
    return 'woof';
  }

  create(createBusinessDto: CreateBusinessDto) {
    return 'This action adds a new business';
  }

  findAll() {
    return `This action returns all business`;
  }

  findOne(id: number) {
    return `This action returns a #${id} business`;
  }

  getOrgBusiness(orgId: string) {
    return `This action returns Organization #${orgId}'s business`;
  }

  update(id: number, updateBusinessDto: UpdateBusinessDto) {
    return `This action updates a #${id} business`;
  }

  remove(id: number) {
    return `This action removes a #${id} business`;
  }
}
