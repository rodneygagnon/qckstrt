export enum DocumentStatus {
  PROCESSINGNPENDING = 'Processing',
  TEXTEXTERACTIONSTARTED = 'Text Extraction Started',
  TEXTEXTERACTIONCOMPLETE = 'Text Extraction Complete',
  TEXTEXTERACTIONFAILED = 'Text Extraction Failed',
  AIEMBEDDINGSSTARTED = 'AI Embeddings Started',
  AIEMBEDDINGSCOMPLETE = 'AI Embeddings Complete',
  AIEMBEDDINGSFAILED = 'AI Embeddings Failed',
  PROCESSINGNCOMPLETE = 'Complete',
}
