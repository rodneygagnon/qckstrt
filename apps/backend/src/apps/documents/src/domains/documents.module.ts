import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsResolver } from './documents.resolver';
import { Storage } from 'src/providers/files';
import { DocumentEntity } from 'src/db/entities/document.entity';

/**
 * Documents Module
 *
 * Provides document metadata management and file storage operations.
 * Manages documents in PostgreSQL and files in S3.
 */
@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  providers: [Storage, DocumentsService, DocumentsResolver],
  exports: [DocumentsService],
})
export class DocumentsModule {}
