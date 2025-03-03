import { IAppConfig } from 'src/config';

import { EmbeddingRepository } from './embedding.repository';
import { ITextExtraction } from '../ocr/ocr';
import { OpenAI } from 'src/providers/ai/openai/open.ai';

export const createEmbeddingsForDocument = async (
  config: IAppConfig,
  document: ITextExtraction,
) => {
  console.log('Config: ', config);
  console.log('Document: ', document);

  const openAI = new OpenAI(config.ai);

  try {
    /** Get the vector embeddings */
    const embeddings = await openAI.getEmbeddingsForText(document.text);

    /** Store the vector embeddings */
    const repository: EmbeddingRepository =
      await EmbeddingRepository.getInstance(config);
    await repository.createEmbeddings(
      document.userId,
      document.documentId,
      embeddings.embeddings,
      embeddings.texts,
    );
  } catch (error) {
    console.log('Error processing document: ', error);
  }
};
