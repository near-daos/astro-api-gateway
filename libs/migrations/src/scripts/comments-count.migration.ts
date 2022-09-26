import { Injectable, Logger } from '@nestjs/common';

import { Comment, CommentService } from '@sputnik-v2/comment';

import { Migration } from '..';

@Injectable()
export class CommentsCountMigration implements Migration {
  private readonly logger = new Logger(CommentsCountMigration.name);

  constructor(private readonly commentService: CommentService) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Comments Count migration...');

    this.logger.log('Retrieving Comments...');
    const allComments: Comment[] = await this.commentService.find();
    this.logger.log(`Retrieved ${allComments.length} Comments.`);
    const uniqueContextComments = allComments.reduce(
      (obj, comment) => ({ [comment.contextId]: comment }),
      {},
    );

    this.logger.log('Setting comment counts...');
    for (const contextId in uniqueContextComments) {
      await this.commentService.updateCommentsCount(
        uniqueContextComments[contextId],
      );
    }

    this.logger.log('Comment counts migration finished.');
  }
}
