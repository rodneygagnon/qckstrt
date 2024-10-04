import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { CreateCultureDto } from './dto/create-culture.dto';
import { UpdateCultureDto } from './dto/update-culture.dto';

@Injectable()
export class CultureService {
  private readonly uniqIdentifier: string;
  constructor() {
    if (!this.uniqIdentifier) {
      this.uniqIdentifier = uuidv4();
    }
    console.log(
      `${this.constructor.name} initialized - ${this.uniqIdentifier}`,
    );
  }

  create(createCultureDto: CreateCultureDto) {
    return `This action adds a new culture (${JSON.stringify(createCultureDto)})`;
  }

  findAll() {
    return `This action returns all cultures`;
  }

  findOne(id: number) {
    return `This action returns a #${id} culture`;
  }

  getOrgCulture(orgId: string) {
    return `This action returns Organization #${orgId}'s culture`;
  }

  update(id: number, updateCultureDto: UpdateCultureDto) {
    return `This action updates a culture (${JSON.stringify(updateCultureDto)} at #${id}`;
  }

  remove(id: number) {
    return `This action removes a #${id} culture`;
  }
}
