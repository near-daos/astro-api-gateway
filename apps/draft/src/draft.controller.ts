import { Controller, Get, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Span } from 'nestjs-ddtrace';

import {
  DraftCommentUpdateDto,
  DraftProposalCloseDto,
} from '@sputnik-v2/event';
import {
  EVENT_DRAFT_DELETE_COMMENT,
  EVENT_DRAFT_NEW_COMMENT,
  EVENT_DRAFT_PROPOSAL_CLOSE,
  EVENT_DRAFT_UPDATE_COMMENT,
} from '@sputnik-v2/common';
import { SocketService } from '@sputnik-v2/websocket';
import { DraftProposalService } from '@sputnik-v2/draft-proposal';

@Span()
@Controller()
export class DraftController {
  private readonly logger = new Logger(DraftController.name);

  constructor(
    private readonly socketService: SocketService,
    private readonly draftProposalService: DraftProposalService,
  ) {}

  @ApiExcludeEndpoint()
  @Get()
  main(): string {
    return 'Astro Draft API v1.0';
  }

  @EventPattern(EVENT_DRAFT_NEW_COMMENT, Transport.REDIS)
  async onNewComment(data: DraftCommentUpdateDto) {
    this.logger.log(
      `Sending new draft comment ${data.comment.id} to Websocket clients.`,
    );
    this.socketService.emitToAllEvent({
      event: 'draft-comment',
      data: data.comment,
    });
  }

  @EventPattern(EVENT_DRAFT_UPDATE_COMMENT, Transport.REDIS)
  async onUpdateComment(data: DraftCommentUpdateDto) {
    this.logger.log(
      `Sending update draft comment ${data.comment.id} to Websocket clients.`,
    );
    this.socketService.emitToAllEvent({
      event: 'draft-comment-updated',
      data: data.comment,
    });
  }

  @EventPattern(EVENT_DRAFT_DELETE_COMMENT, Transport.REDIS)
  async onDeleteComment(data: DraftCommentUpdateDto) {
    this.logger.log(
      `Sending removed draft comment ${data.comment.id} to Websocket clients.`,
    );
    this.socketService.emitToAllEvent({
      event: 'draft-comment-removed',
      data: data.comment,
    });
  }

  @EventPattern(EVENT_DRAFT_PROPOSAL_CLOSE, Transport.REDIS)
  async onCloseDraftProposal(data: DraftProposalCloseDto) {
    this.logger.log(
      `Closing draft ${data.draftId} due to proposal creation: ${data.proposalId}`,
    );
    await this.draftProposalService.closeInternal(
      data.daoId,
      data.draftId,
      data.proposalId,
    );
  }
}
