import { Injectable, Logger } from '@nestjs/common';
import { IsNull, Not } from 'typeorm';

import {
  Comment,
  CommentContextType,
  CommentService,
} from '@sputnik-v2/comment';

import { Migration } from '..';

@Injectable()
export class CommentProposalContextMigration implements Migration {
  private readonly logger = new Logger(CommentProposalContextMigration.name);

  constructor(private readonly commentService: CommentService) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Comment Context migration...');

    this.logger.log('Retrieving Proposal Comments...');
    const allProposalComments: Comment[] = await this.commentService.find({
      proposalId: Not(IsNull()),
    });
    this.logger.log(
      `Retrieved ${allProposalComments.length} Proposal Comments.`,
    );

    this.logger.log('Setting comment contexts...');
    await this.commentService.updateMultiple(
      allProposalComments.map((comment) => {
        return {
          ...comment,
          contextId: comment.proposalId,
          contextType: CommentContextType.Proposal,
        };
      }),
    );

    this.logger.log('Bounty Proposal Id migration finished.');
  }
}
