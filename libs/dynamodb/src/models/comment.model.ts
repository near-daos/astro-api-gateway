import { Comment, CommentReport } from '@sputnik-v2/comment/entities';
import { CommentContextType } from '@sputnik-v2/comment/types';
import { DraftComment } from '@sputnik-v2/draft-comment/entities';
import { DraftCommentContextType } from '@sputnik-v2/draft-comment/types';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType, PartialEntity } from '../types';

export class CommentModel extends BaseModel {
  id: string;
  contextId: string;
  contextType: CommentContextType | DraftCommentContextType;
  author: string;
  message: string;
  replyTo?: string;
  likeAccounts?: string[];
  dislikeAccounts?: string[];
  reports?: CommentReportModel[];
}

export class CommentReportModel {
  id: string;
  accountId: string;
  reason: string;
}

export function mapCommentToCommentModel(
  comment: Partial<Comment>,
): PartialEntity<CommentModel> {
  const entityType = mapCommentContextTypeToEntityType(comment.contextType);
  return {
    partitionId: comment.daoId,
    entityId: buildEntityId(entityType, `${comment.contextId}:${comment.id}`),
    entityType,
    isArchived: !!comment.isArchived,
    createdAt: comment.createdAt ? comment.createdAt.getTime() : undefined,
    updatedAt: comment.updatedAt ? comment.updatedAt.getTime() : undefined,
    id: comment.id.toString(),
    contextId: comment.contextId,
    contextType: comment.contextType,
    author: comment.accountId,
    message: comment.message,
    replyTo: comment.message,
    reports: comment.reports?.length
      ? comment.reports.map(mapCommentReportToCommentReportModel)
      : undefined,
  };
}

export function mapDraftCommentToCommentModel(
  comment: Partial<DraftComment>,
): PartialEntity<CommentModel> {
  const entityType = mapCommentContextTypeToEntityType(comment.contextType);
  return {
    partitionId: comment.daoId,
    entityId: buildEntityId(entityType, `${comment.contextId}:${comment.id}`),
    entityType,
    isArchived: !!comment.isArchived,
    createdAt: comment.createdAt ? comment.createdAt.getTime() : undefined,
    updatedAt: comment.updatedAt ? comment.updatedAt.getTime() : undefined,
    id: comment.id.toString(),
    contextId: comment.contextId,
    contextType: comment.contextType,
    author: comment.author,
    message: comment.message,
    replyTo: comment.replyTo,
    likeAccounts: comment.likeAccounts,
    dislikeAccounts: comment.dislikeAccounts,
  };
}

export function mapCommentReportToCommentReportModel(
  report: CommentReport,
): CommentReportModel {
  return {
    id: report.id,
    accountId: report.accountId,
    reason: report.reason,
  };
}

export function mapCommentContextTypeToEntityType(
  contextType: CommentContextType | DraftCommentContextType,
): DynamoEntityType {
  switch (contextType) {
    case CommentContextType.BountyContext:
      return DynamoEntityType.BountyComment;
    case CommentContextType.Proposal:
      return DynamoEntityType.ProposalComment;
    case DraftCommentContextType.DraftProposal:
      return DynamoEntityType.DraftProposalComment;
  }
}
