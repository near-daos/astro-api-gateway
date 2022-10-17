import { Comment, CommentContextType } from '@sputnik-v2/comment';

import { BaseOpensearchDto } from './base-opensearch.dto';

export class CommentOpensearchDto extends BaseOpensearchDto {
  id: string;
  daoId: string;
  proposalId: string;
  contextId: string;
  contextType: CommentContextType;
  accountId: string;
  message: string;
  isArchived: boolean;
}

export function mapCommentToOpensearchDto(
  comment: Comment,
): CommentOpensearchDto {
  const {
    id,
    accountId,
    daoId,
    proposalId,
    contextId,
    contextType,
    message,
    isArchived,
  } = comment;

  const dto: CommentOpensearchDto = {
    id: `${id}`,
    name: `${id}`,
    description: message,
    accounts: accountId,
    daoId,
    accountId,
    proposalId,
    contextId,
    contextType,
    message,
    isArchived,
    indexedBy: 'nodejs',
  };

  return dto;
}
