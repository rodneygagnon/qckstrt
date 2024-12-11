import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';
import { UsersResolver } from './users.resolver';

import { File } from 'src/apps/files/src/domains/files/models/file.model';
import { AWSS3 } from 'src/providers/files/aws.s3';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [AWSS3, FilesService, FilesResolver, UsersResolver],
  exports: [FilesService],
})
export class FilesModule {}
