import { NotificationDto } from '@sputnik-v2/notification/dto';
import { DaoUpdateDto, ProposalUpdateDto } from '@sputnik-v2/event';
import { buildNotificationId } from '@sputnik-v2/utils';
import { NotificationStatus, NotificationType } from '@sputnik-v2/notification';

export interface NotificationAction {
  type: NotificationType;
  status?: NotificationStatus;
}

export function castDaoUpdateNotification(
  data: DaoUpdateDto,
  action: NotificationAction,
): NotificationDto {
  return {
    id: buildNotificationId(action.type, String(data.txAction.transactionHash)),
    daoId: data.dao.id,
    targetId: data.dao.id,
    type: action.type,
    status: action.status,
    signerId: data.txAction.signerId,
    metadata: {
      methodName: data.txAction.methodName,
      args: data.txAction.args,
    },
    timestamp: data.txAction.timestamp,
  };
}

export function castProposalUpdateNotification(
  data: ProposalUpdateDto,
  action: NotificationAction,
): NotificationDto {
  return {
    id: buildNotificationId(action.type, String(data.txAction.transactionHash)),
    daoId: data.proposal.daoId,
    targetId: data.proposal.id,
    signerId: data.txAction.signerId,
    type: action.type,
    status: action.status,
    metadata: {
      methodName: data.txAction.methodName,
      args: data.txAction.args,
      proposal: {
        id: data.proposal.id,
        proposer: data.proposal.proposer,
        description: data.proposal.description,
        kind: data.proposal.kind?.kind,
        votes: data.proposal.votes,
      },
    },
    timestamp: data.txAction.timestamp,
  };
}
