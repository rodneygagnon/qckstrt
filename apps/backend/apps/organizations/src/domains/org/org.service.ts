import { Injectable } from '@nestjs/common';

import { LazyModuleFactory, LazyModuleKey } from '../../factories/lazy-module.factory';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';

@Injectable()
export class OrgService {
  constructor() {
    console.log(`${this.constructor.name} initialized`);
  }

  create(createOrgDto: CreateOrgDto) {
    return 'This action adds a new org';
  }

  findAll() {
    return `This action returns all orgs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} org`;
  }

  update(id: number, updateOrgDto: UpdateOrgDto) {
    return `This action updates a #${id} org`;
  }

  remove(id: number) {
    return `This action removes a #${id} org`;
  }

  async getOrgBusiness(orgId: string) {
    return (await this.lazyLoadBusinessService()).getOrgBusiness(orgId);
  }

  async getOrgCulture(orgId: string) {
    return (await this.lazyLoadCultureService()).getOrgCulture(orgId);
  }

  private async lazyLoadBusinessService() {
    const { BusinessModule } = await import('../business/business.module');
    const moduleRef = await LazyModuleFactory.instance.getRef(LazyModuleKey.Business, BusinessModule);

    const { BusinessService } = await import('../business/business.service');
    return moduleRef.get(BusinessService);
  }

  private async lazyLoadCultureService() {
    const { CultureModule } = await import('../culture/culture.module');
    const moduleRef = await LazyModuleFactory.instance.getRef(LazyModuleKey.Culture, CultureModule);

    const { CultureService } = await import('../culture/culture.service');
    return moduleRef.get(CultureService);
  }
}
