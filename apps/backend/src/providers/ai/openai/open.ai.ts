import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIClient, OpenAIEmbeddings } from '@langchain/openai';

import { IAIConfig } from 'src/config';

export interface IEmbeddings {
  texts: string[];
  embeddings: number[][];
}

const chunkText = async (
  text: string,
  chunkSize: number,
  chunkOverlap: number,
): Promise<string[]> =>
  new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap }).splitText(
    text,
  );

export class OpenAI {
  private embeddings: OpenAIEmbeddings;
  private gpt: OpenAIClient;

  constructor(private config: IAIConfig) {
    this.embeddings = new OpenAIEmbeddings({
      apiKey: config.apiKey,
      batchSize: config.batchSize,
      model: config.embeddingModel,
    });
    this.gpt = new OpenAIClient({ apiKey: config.apiKey });
  }

  async getEmbeddingsForText(text: string): Promise<IEmbeddings> {
    const chunks = await chunkText(
      text,
      this.config.chunkSize,
      this.config.chunkOverlap,
    );

    console.log('Chunks: ', chunks);

    return {
      texts: chunks,
      embeddings: await this.embeddings.embedDocuments(chunks),
    };
  }

  async getEmbeddingsForQuery(query: string): Promise<number[]> {
    return this.embeddings.embedQuery(query);
  }

  // TODO: Implement ChatAI capabilities here that use RAG and query
}
