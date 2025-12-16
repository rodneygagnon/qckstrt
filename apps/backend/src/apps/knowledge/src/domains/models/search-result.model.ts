import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

/**
 * Single search result with metadata
 */
@ObjectType()
export class SearchResult {
  @Field()
  content!: string;

  @Field()
  documentId!: string;

  @Field(() => Float)
  score!: number;
}

/**
 * Paginated search results with metadata
 */
@ObjectType()
export class PaginatedSearchResults {
  @Field(() => [SearchResult])
  results!: SearchResult[];

  @Field(() => Int)
  total!: number;

  @Field()
  hasMore!: boolean;
}
