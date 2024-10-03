import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { LazyModuleFactory, LazyModuleKey } from '../../factories/lazy-module.factory';
import { CreateBusinessDto } from '../business/dto/create-business.dto';
import { UpdateBusinessDto } from '../business/dto/update-business.dto';

@Controller('business')
export class BusinessApiController {
  constructor() {
    console.log(`${this.constructor.name} initialized`);
  }

  @Post()
  async create(@Body() createBusinessDto: CreateBusinessDto) {
    const dogsService = await this.lazyLoadBusinessService();

    return dogsService.create(createBusinessDto);
  }

  @Get('lazy')
  async lazy() {
    const dogsService = await this.lazyLoadBusinessService();

    return dogsService.talk();
  }

  @Get()
  async findAll() {
    const dogsService = await this.lazyLoadBusinessService();

    return dogsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const dogsService = await this.lazyLoadBusinessService();

    return dogsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto) {
    const dogsService = await this.lazyLoadBusinessService();

    return dogsService.update(+id, updateBusinessDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const dogsService = await this.lazyLoadBusinessService();

    return dogsService.remove(+id);
  }

  private async lazyLoadBusinessService() {
    const { BusinessModule } = await import('../business/business.module');
    const moduleRef = await LazyModuleFactory.instance.getRef(LazyModuleKey.Business, BusinessModule);

    const { BusinessService } = await import('../business/business.service');
    return moduleRef.get(BusinessService);
  }
}
