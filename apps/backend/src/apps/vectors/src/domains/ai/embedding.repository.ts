import { DataSource, Repository /*, UpdateResult */ } from 'typeorm';

import { EmbeddingEntity } from 'src/db/entities/embedding.entity';

import { getConnectionOptions } from 'src/providers/db';

import { IAppConfig } from 'src/config';

export class EmbeddingRepository {
  static #instance: EmbeddingRepository;

  private dataSource: DataSource;
  private repository: Repository<EmbeddingEntity>;

  public static async getInstance(config: IAppConfig) {
    if (!EmbeddingRepository.#instance) {
      EmbeddingRepository.#instance = new EmbeddingRepository(config);

      await EmbeddingRepository.#instance.dataSource.initialize();
      EmbeddingRepository.#instance.repository =
        await EmbeddingRepository.#instance.dataSource.getRepository(
          EmbeddingEntity,
        );
    }

    return EmbeddingRepository.#instance;
  }

  private constructor(config: IAppConfig) {
    const dbConfig = getConnectionOptions(
      config.region || '',
      config.db,
      { entities: [EmbeddingEntity] }, //[`${__dirname}/models/*.{j,t}s`] }
    );
    // const dbConfig = {
    //   postgresConnectionOptions: {
    //     type: config.db.config.type,
    //     host: config.db.config.host,
    //     port: 5433,
    //     user: "myuser",
    //     password: "ChangeMe",
    //     database: "api",
    //   } as any,
    //   tableName: "testlangchainjs",
    //   columns: {
    //     idColumnName: "id",
    //     vectorColumnName: "vector",
    //     contentColumnName: "content",
    //     metadataColumnName: "metadata",
    //   },
    //   // supported distance strategies: cosine (default), innerProduct, or euclidean
    //   distanceStrategy: "cosine" as DistanceStrategy,
    // };

    this.dataSource = new DataSource(dbConfig);
  }

  async createEmbeddings(
    userId: string,
    documentId: string,
    embeddings: number[][],
    content: string[],
  ): Promise<boolean> {
    const rows = embeddings.map((embedding, idx) => {
      const embeddingString = `[${embedding.join(',')}]`;
      const documentRow = {
        userId,
        content: content[idx],
        embedding: embeddingString,
        metadata: { source: `${documentId}` },
      };

      return documentRow;
    });

    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);

      console.log('DocumentRow(s): ', chunk);

      try {
        await this.repository?.save(chunk);
      } catch (e) {
        console.error(e);
        throw new Error(`Error inserting: ${chunk[0].content}`);
      }
    }

    return Promise.resolve(true);
  }

  // async getDocumentById(id: string): Promise<Document | null> {
  //     return this.repository?.findOne({ where: { id } })
  // }

  // async getDocumentByChecksum(checksum: string): Promise<Document | null> {
  //   return this.repository?.findOne({ where: { checksum } })
  // }

  // async getDocumentByLocationAndKey(location: string, key: string): Promise<Document | null> {
  //   return this.repository?.findOne({ where: { location, key } })
  // }

  // async updateDocument(id: string, document: Partial<Document>): Promise<UpdateResult> {
  //     return this.repository?.update(id, document);
  // }

  async deleteEmbedding(id: number): Promise<void> {
    await this.repository?.delete(id);
  }
}
