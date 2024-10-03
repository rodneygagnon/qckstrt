import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { LazyModuleFactory, LazyModuleKey } from '../../factories/lazy-module.factory';
import { CreateCultureDto } from '../culture/dto/create-culture.dto';
import { UpdateCultureDto } from '../culture/dto/update-culture.dto';

@Controller('culture')
export class CultureApiController {
  constructor() {
    console.log(`${this.constructor.name} initialized`);
  }

  @Post()
  async create(@Body() createCatDto: CreateCultureDto) {
    const cultureService = await this.lazyLoadCultureService();
    return cultureService.create(createCatDto);
  }

  @Get()
  async findAll() {
    const cultureService = await this.lazyLoadCultureService();
    return cultureService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cultureService = await this.lazyLoadCultureService();
    return cultureService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCatDto: UpdateCultureDto) {
    const cultureService = await this.lazyLoadCultureService();
    return cultureService.update(+id, updateCatDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const cultureService = await this.lazyLoadCultureService();
    return cultureService.remove(+id);
  }

  private async lazyLoadCultureService() {
    const { CultureModule } = await import('../culture/culture.module');
    const moduleRef = await LazyModuleFactory.instance.getRef(LazyModuleKey.Culture, CultureModule);

    const { CultureService } = await import('../culture/culture.service');
    return moduleRef.get(CultureService);
  }
}
