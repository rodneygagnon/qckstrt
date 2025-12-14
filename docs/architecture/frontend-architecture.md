# Frontend Architecture

## Overview

The QCKSTRT frontend is a modern React application built with Next.js 16, React 19, and Tailwind CSS 4. It provides a responsive web interface for interacting with the RAG (Retrieval-Augmented Generation) pipeline.

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Next.js | 16.x | React framework with App Router |
| **Runtime** | React | 19.x | UI component library |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS framework |
| **GraphQL Client** | Apollo Client | 4.x | GraphQL state management |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |

## Project Structure

```
apps/frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   └── rag-demo/          # RAG Demo feature
│       └── page.tsx       # RAG Demo page
├── lib/                    # Shared utilities
│   ├── apollo-client.ts   # Apollo Client configuration
│   ├── apollo-provider.tsx # Apollo Provider wrapper
│   └── graphql/           # GraphQL operations
│       └── knowledge.ts   # Knowledge service queries/mutations
├── __tests__/             # Jest unit tests
├── cypress/               # Cypress E2E tests
│   ├── e2e/              # E2E test specs
│   ├── fixtures/         # Test fixtures
│   └── support/          # Custom commands
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest configuration
└── cypress.config.ts     # Cypress configuration
```

## Core Architecture

### Next.js App Router

The frontend uses Next.js 16 with the App Router pattern:

```
app/
├── layout.tsx          # Root layout (applies to all pages)
├── page.tsx            # Home page (/)
└── rag-demo/
    └── page.tsx        # RAG Demo page (/rag-demo)
```

**Key Features**:
- Server Components by default for improved performance
- Client Components with `"use client"` directive for interactivity
- File-based routing with nested layouts

### Apollo Client Integration

GraphQL communication with the backend uses Apollo Client 4:

```typescript
// lib/apollo-client.ts
const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

**Configuration**:
- HTTP Link pointing to GraphQL Gateway (port 3000)
- Auth Link for adding user headers to requests
- In-memory cache for query results

### GraphQL Operations

All GraphQL queries and mutations are centralized in `lib/graphql/`:

```typescript
// lib/graphql/knowledge.ts
export const INDEX_DOCUMENT = gql`
  mutation IndexDocument($userId: String!, $documentId: String!, $text: String!) {
    indexDocument(userId: $userId, documentId: $documentId, text: $text)
  }
`;

export const ANSWER_QUERY = gql`
  mutation AnswerQuery($userId: String!, $query: String!) {
    answerQuery(userId: $userId, query: $query)
  }
`;
```

**Operations Available**:
- `INDEX_DOCUMENT` - Index text into vector database
- `ANSWER_QUERY` - Ask question with RAG
- `SEARCH_TEXT` - Semantic search without LLM

## State Management

### Client-Side State

The frontend uses a combination of:
- **React useState** - Local component state
- **Apollo Client Cache** - Server state (GraphQL responses)
- **localStorage** - Persistent demo user session

### Demo User Management

For the RAG demo, user sessions are managed via localStorage:

```typescript
interface DemoUser {
  id: string;
  email: string;
  roles: string[];
  department: string;
  clearance: string;
}

// Store user
localStorage.setItem("user", JSON.stringify(demoUser));

// Retrieve user
const user = JSON.parse(localStorage.getItem("user") || "null");
```

## Component Architecture

### Page Components

Page components are React Server Components by default:

```typescript
// app/page.tsx (Server Component)
export default function Home() {
  return <main>...</main>;
}
```

### Client Components

Interactive components use the `"use client"` directive:

```typescript
// app/rag-demo/page.tsx (Client Component)
"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";

export default function RAGDemo() {
  const [query, setQuery] = useState("");
  // ...
}
```

### Provider Hierarchy

The root layout establishes the provider hierarchy:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ApolloProvider>
          {children}
        </ApolloProvider>
      </body>
    </html>
  );
}
```

## Styling

### Tailwind CSS 4

The frontend uses Tailwind CSS 4 with the new configuration format:

```css
/* app/globals.css */
@import "tailwindcss";
```

**Features**:
- Utility-first CSS classes
- Dark mode support (`dark:` variants)
- Responsive design (`sm:`, `md:`, `lg:` breakpoints)
- Custom color scheme

### Design Patterns

```tsx
// Common patterns used
<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
    Title
  </h2>
  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
    Action
  </button>
</div>
```

## API Communication

### GraphQL Endpoint

The frontend communicates with the backend via GraphQL:

```
Frontend (Next.js)
    ↓ GraphQL
API Gateway (Port 3000)
    ↓ Federation
Microservices (Users, Documents, Knowledge, Files)
```

### Request Flow

1. **User Action** - Button click, form submit
2. **GraphQL Mutation/Query** - Apollo Client sends request
3. **Auth Header** - Demo user ID added to headers
4. **API Gateway** - Routes to appropriate service
5. **Response** - Data returned and cached

### Error Handling

```typescript
try {
  const result = await answerQuery({ variables: { userId, query } });
  setAnswer(result.data?.answerQuery || "No answer");
} catch (error) {
  setAnswer(`Error: ${error.message}`);
}
```

## Performance Considerations

### Next.js Optimizations

- **Server Components** - Reduce client JavaScript bundle
- **Automatic Code Splitting** - Per-page bundles
- **Image Optimization** - Next.js Image component
- **Font Optimization** - Next.js Font component

### Apollo Client Optimizations

- **In-Memory Cache** - Avoid redundant network requests
- **Query Deduplication** - Prevent duplicate simultaneous requests
- **Normalized Cache** - Efficient updates

## Security

### Demo Mode

The current implementation uses demo mode without full authentication:

```typescript
// Demo user stored in localStorage
// Headers sent with each GraphQL request
headers: {
  "x-user-id": user.id,
}
```

### Production Considerations

For production, integrate with AWS Cognito:

- JWT tokens for authentication
- Refresh token handling
- Protected routes
- Session management

## Environment Configuration

### Development

```bash
# .env.local (optional)
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
```

### Production

```bash
# Environment variables for production
NEXT_PUBLIC_GRAPHQL_URL=https://api.yourapp.com/graphql
```

## Build & Deployment

### Development Server

```bash
pnpm dev          # Start dev server on port 3000
```

### Production Build

```bash
pnpm build        # Create production build
pnpm start        # Start production server
```

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN pnpm build

FROM node:20-alpine
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
CMD ["pnpm", "start"]
```

## Related Documentation

- [System Overview](system-overview.md) - Overall architecture
- [RAG Demo Guide](../guides/frontend-rag-demo.md) - Using the RAG demo
- [Frontend Testing](../guides/frontend-testing.md) - Testing guide
- [Getting Started](../guides/getting-started.md) - Development setup
