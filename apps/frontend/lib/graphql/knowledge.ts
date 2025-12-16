import { gql } from "@apollo/client";

export interface IndexDocumentData {
  indexDocument: boolean;
}

export interface IndexDocumentVars {
  userId: string;
  documentId: string;
  text: string;
}

export interface AnswerQueryData {
  answerQuery: string;
}

export interface AnswerQueryVars {
  userId: string;
  query: string;
}

export interface SearchResult {
  content: string;
  documentId: string;
  score: number;
}

export interface PaginatedSearchResults {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
}

export interface SearchTextData {
  searchText: PaginatedSearchResults;
}

export interface SearchTextVars {
  userId: string;
  query: string;
  skip?: number;
  take?: number;
}

export const INDEX_DOCUMENT = gql`
  mutation IndexDocument($userId: ID!, $documentId: String!, $text: String!) {
    indexDocument(userId: $userId, documentId: $documentId, text: $text)
  }
`;

export const ANSWER_QUERY = gql`
  mutation AnswerQuery($userId: ID!, $query: String!) {
    answerQuery(userId: $userId, query: $query)
  }
`;

export const SEARCH_TEXT = gql`
  query SearchText($userId: ID!, $query: String!, $skip: Int, $take: Int) {
    searchText(userId: $userId, query: $query, skip: $skip, take: $take) {
      results {
        content
        documentId
        score
      }
      total
      hasMore
    }
  }
`;
