import { DataSource, Repository, UpdateResult } from 'typeorm';

import { DocumentEntity } from 'src/db/entities/document.entity';

import { getConnectionOptions } from 'src/providers/db';

import { IAppConfig } from 'src/config';

export class DocumentRepository {
  static #instance: DocumentRepository;

  private dataSource: DataSource;
  private repository: Repository<DocumentEntity>;

  public static async getInstance(config: IAppConfig) {
    if (!DocumentRepository.#instance) {
      DocumentRepository.#instance = new DocumentRepository(config);

      await DocumentRepository.#instance.dataSource.initialize();
      DocumentRepository.#instance.repository =
        await DocumentRepository.#instance.dataSource.getRepository(
          DocumentEntity,
        );
    }

    return DocumentRepository.#instance;
  }

  private constructor(config: IAppConfig) {
    const dbConfig = getConnectionOptions(
      config.region || '',
      config.db,
      { entities: [DocumentEntity] }, //[`${__dirname}/models/*.{j,t}s`] }
    );

    this.dataSource = new DataSource(dbConfig);
  }

  async createDocument(
    location: string,
    userId: string,
    key: string,
    size: number,
    checksum: string,
  ): Promise<DocumentEntity> {
    return this.repository?.save({
      location,
      userId,
      key,
      size,
      checksum,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async getDocumentById(id: string): Promise<DocumentEntity | null> {
    return this.repository?.findOne({ where: { id } });
  }

  async getDocumentByChecksum(
    checksum: string,
  ): Promise<DocumentEntity | null> {
    return this.repository?.findOne({ where: { checksum } });
  }

  async getDocumentByLocationUserKey(
    location: string,
    userId: string,
    key: string,
  ): Promise<DocumentEntity | null> {
    return this.repository?.findOne({ where: { location, userId, key } });
  }

  async updateDocument(
    id: string,
    document: Partial<DocumentEntity>,
  ): Promise<UpdateResult> {
    return this.repository?.update(id, document);
  }

  async deleteDocument(id: number): Promise<void> {
    await this.repository?.delete(id);
  }
}
