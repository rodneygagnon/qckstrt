import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { KnowledgeService } from './knowledge.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Action } from 'src/common/enums/action.enum';
import { Permissions } from 'src/common/decorators/permissions.decorator';

/**
 * Knowledge Resolver
 *
 * Handles semantic search and RAG operations.
 */
@Resolver()
export class KnowledgeResolver {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Update,
    subject: 'File',
    conditions: { userId: '{{ userId }}' },
  })
  async answerQuery(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args('query') query: string,
  ): Promise<string> {
    return this.knowledgeService.answerQuery(userId, query);
  }

  @Query(() => [String])
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Read,
    subject: 'File',
    conditions: { userId: '{{ userId }}' },
  })
  async searchText(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args('query') query: string,
    @Args({ name: 'count', type: () => Int, defaultValue: 3 }) count: number,
  ): Promise<string[]> {
    return this.knowledgeService.searchText(userId, query, count);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  @Permissions({
    action: Action.Create,
    subject: 'File',
    conditions: { userId: '{{ userId }}' },
  })
  async indexDocument(
    @Args({ name: 'userId', type: () => ID }) userId: string,
    @Args('documentId') documentId: string,
    @Args('text') text: string,
  ): Promise<boolean> {
    try {
      await this.knowledgeService.indexDocument(userId, documentId, text);
      return true;
    } catch (error) {
      return false;
    }
  }
}
