import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';
import { UsersResolver } from './users.resolver';

import { Storage } from 'src/providers/files';
import { AI } from 'src/providers/ai';
import { DocumentEntity } from 'src/db/entities/document.entity';
import { EmbeddingEntity } from 'src/db/entities/embedding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, EmbeddingEntity])],
  providers: [Storage, AI, FilesService, FilesResolver, UsersResolver],
  exports: [FilesService],
})
export class FilesModule {}
