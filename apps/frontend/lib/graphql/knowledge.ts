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

export interface SearchTextData {
  searchText: string[];
}

export interface SearchTextVars {
  userId: string;
  query: string;
  count?: number;
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
  query SearchText($userId: ID!, $query: String!, $count: Int) {
    searchText(userId: $userId, query: $query, count: $count)
  }
`;
