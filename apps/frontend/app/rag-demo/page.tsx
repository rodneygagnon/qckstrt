"use client";

import { useState } from "react";
import { useMutation, useLazyQuery } from "@apollo/client/react";
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
} from "@/lib/graphql/knowledge";
import {
  setDemoUser,
  getDemoUser,
  clearDemoUser,
  DemoUser,
} from "@/lib/apollo-client";

function getInitialUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  return getDemoUser();
}

function getInitialEmail(): string {
  if (typeof window === "undefined") return "demo@example.com";
  const user = getDemoUser();
  return user?.email || "demo@example.com";
}

export default function RAGDemo() {
  const [user, setUser] = useState<DemoUser | null>(getInitialUser);
  const [documentText, setDocumentText] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"index" | "query">("index");

  // Demo user form state
  const [email, setEmail] = useState(getInitialEmail);

  const [indexDocument, { loading: indexing }] = useMutation<
    IndexDocumentData,
    IndexDocumentVars
  >(INDEX_DOCUMENT);
  const [answerQuery, { loading: answering }] = useMutation<
    AnswerQueryData,
    AnswerQueryVars
  >(ANSWER_QUERY);
  const [searchText, { loading: searching }] = useLazyQuery<
    SearchTextData,
    SearchTextVars
  >(SEARCH_TEXT);

  const handleLogin = () => {
    const demoUser: DemoUser = {
      id: crypto.randomUUID(),
      email,
      roles: ["user"],
      department: "demo",
      clearance: "public",
    };
    setDemoUser(demoUser);
    setUser(demoUser);
  };

  const handleLogout = () => {
    clearDemoUser();
    setUser(null);
    setAnswer("");
    setSearchResults([]);
  };

  const handleIndexDocument = async () => {
    if (!user || !documentText.trim()) return;

    const docId = documentId.trim() || `doc-${Date.now()}`;
    try {
      const result = await indexDocument({
        variables: {
          userId: user.id,
          documentId: docId,
          text: documentText,
        },
      });

      if (result.data?.indexDocument) {
        alert(`Document "${docId}" indexed successfully!`);
        setDocumentId("");
        setDocumentText("");
      } else {
        alert("Failed to index document");
      }
    } catch (error) {
      console.error("Index error:", error);
      alert(
        `Error indexing document: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleAskQuestion = async () => {
    if (!user || !query.trim()) return;

    try {
      const result = await answerQuery({
        variables: {
          userId: user.id,
          query: query,
        },
      });

      setAnswer(result.data?.answerQuery || "No answer received");
    } catch (error) {
      console.error("Query error:", error);
      setAnswer(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleSearch = async () => {
    if (!user || !query.trim()) return;

    try {
      const result = await searchText({
        variables: {
          userId: user.id,
          query: query,
          count: 5,
        },
      });

      setSearchResults(result.data?.searchText || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            RAG Demo - Login
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Enter an email to create a demo session. This creates a temporary
              user for testing the RAG pipeline.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="demo@example.com"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md
                         transition-colors"
              >
                Start Demo Session
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            RAG Pipeline Demo
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("index")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "index"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Index Document
          </button>
          <button
            onClick={() => setActiveTab("query")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "query"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Query Knowledge Base
          </button>
        </div>

        {/* Index Document Tab */}
        {activeTab === "index" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Index a Document
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Paste text content below to index it into the vector database.
              This text will be chunked, embedded, and stored for semantic
              search and RAG queries.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Document ID (optional)
                </label>
                <input
                  type="text"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., my-document-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Document Text
                </label>
                <textarea
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           font-mono text-sm"
                  placeholder="Paste your document text here..."
                />
              </div>
              <button
                onClick={handleIndexDocument}
                disabled={indexing || !documentText.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white
                         font-medium py-2 px-6 rounded-md transition-colors"
              >
                {indexing ? "Indexing..." : "Index Document"}
              </button>
            </div>
          </div>
        )}

        {/* Query Tab */}
        {activeTab === "query" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ask a Question
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ask a question about your indexed documents. The system will
                search for relevant context and generate an answer using the
                LLM.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Question
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., What are the main topics discussed in the document?"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAskQuestion}
                    disabled={answering || !query.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white
                             font-medium py-2 px-6 rounded-md transition-colors"
                  >
                    {answering ? "Thinking..." : "Ask Question (RAG)"}
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={searching || !query.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white
                             font-medium py-2 px-6 rounded-md transition-colors"
                  >
                    {searching ? "Searching..." : "Search Only"}
                  </button>
                </div>
              </div>
            </div>

            {/* Answer Display */}
            {answer && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Answer
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {answer}
                  </p>
                </div>
              </div>
            )}

            {/* Search Results Display */}
            {searchResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Relevant Chunks ({searchResults.length})
                </h3>
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {result}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
