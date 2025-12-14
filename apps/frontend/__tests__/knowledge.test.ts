import {
  INDEX_DOCUMENT,
  ANSWER_QUERY,
  SEARCH_TEXT,
  IndexDocumentData,
  IndexDocumentVars,
  AnswerQueryData,
  AnswerQueryVars,
  SearchTextData,
  SearchTextVars,
} from "../lib/graphql/knowledge";

describe("GraphQL knowledge operations", () => {
  describe("INDEX_DOCUMENT", () => {
    it("should be a valid GraphQL document", () => {
      expect(INDEX_DOCUMENT).toBeDefined();
      expect(INDEX_DOCUMENT.kind).toBe("Document");
    });

    it("should have the correct operation name", () => {
      const definition = INDEX_DOCUMENT.definitions[0];
      expect(definition.kind).toBe("OperationDefinition");
      if (definition.kind === "OperationDefinition") {
        expect(definition.operation).toBe("mutation");
        expect(definition.name?.value).toBe("IndexDocument");
      }
    });
  });

  describe("ANSWER_QUERY", () => {
    it("should be a valid GraphQL document", () => {
      expect(ANSWER_QUERY).toBeDefined();
      expect(ANSWER_QUERY.kind).toBe("Document");
    });

    it("should have the correct operation name", () => {
      const definition = ANSWER_QUERY.definitions[0];
      expect(definition.kind).toBe("OperationDefinition");
      if (definition.kind === "OperationDefinition") {
        expect(definition.operation).toBe("mutation");
        expect(definition.name?.value).toBe("AnswerQuery");
      }
    });
  });

  describe("SEARCH_TEXT", () => {
    it("should be a valid GraphQL document", () => {
      expect(SEARCH_TEXT).toBeDefined();
      expect(SEARCH_TEXT.kind).toBe("Document");
    });

    it("should have the correct operation name", () => {
      const definition = SEARCH_TEXT.definitions[0];
      expect(definition.kind).toBe("OperationDefinition");
      if (definition.kind === "OperationDefinition") {
        expect(definition.operation).toBe("query");
        expect(definition.name?.value).toBe("SearchText");
      }
    });
  });

  describe("Type interfaces", () => {
    it("IndexDocumentData should have correct shape", () => {
      const data: IndexDocumentData = { indexDocument: true };
      expect(data.indexDocument).toBe(true);
    });

    it("IndexDocumentVars should have correct shape", () => {
      const vars: IndexDocumentVars = {
        userId: "user-1",
        documentId: "doc-1",
        text: "Sample text",
      };
      expect(vars.userId).toBe("user-1");
      expect(vars.documentId).toBe("doc-1");
      expect(vars.text).toBe("Sample text");
    });

    it("AnswerQueryData should have correct shape", () => {
      const data: AnswerQueryData = { answerQuery: "The answer is 42" };
      expect(data.answerQuery).toBe("The answer is 42");
    });

    it("AnswerQueryVars should have correct shape", () => {
      const vars: AnswerQueryVars = {
        userId: "user-1",
        query: "What is the meaning of life?",
      };
      expect(vars.userId).toBe("user-1");
      expect(vars.query).toBe("What is the meaning of life?");
    });

    it("SearchTextData should have correct shape", () => {
      const data: SearchTextData = {
        searchText: ["result1", "result2", "result3"],
      };
      expect(data.searchText).toHaveLength(3);
      expect(data.searchText[0]).toBe("result1");
    });

    it("SearchTextVars should have correct shape", () => {
      const vars: SearchTextVars = {
        userId: "user-1",
        query: "search term",
        count: 5,
      };
      expect(vars.userId).toBe("user-1");
      expect(vars.query).toBe("search term");
      expect(vars.count).toBe(5);
    });

    it("SearchTextVars count should be optional", () => {
      const vars: SearchTextVars = {
        userId: "user-1",
        query: "search term",
      };
      expect(vars.count).toBeUndefined();
    });
  });
});
