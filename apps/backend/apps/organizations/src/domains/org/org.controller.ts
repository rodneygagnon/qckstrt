import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto } from './dto/update-org.dto';
import { OrgService } from './org.service';

@Controller('org')
export class OrgController {
  constructor(private readonly orgService: OrgService) {
    console.log(`${this.constructor.name} initialized`);
  }

  @Get()
  findAll() {
    return this.orgService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgService.findOne(+id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization Business Data...',
  })
  @Get(':id/business')
  getOrgBusiness(@Param('id') id: string) {
    return this.orgService.getOrgBusiness(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization Culture Data...',
  })
  @Get(':id/culture')
  getOrgCulture(@Param('id') id: string) {
    return this.orgService.getOrgCulture(id);
  }

  @Post()
  create(@Body() createOrgDto: CreateOrgDto) {
    return this.orgService.create(createOrgDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrgDto: UpdateOrgDto) {
    return this.orgService.update(+id, updateOrgDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orgService.remove(+id);
  }
}
