import { NotificationDto } from '@sputnik-v2/notification/dto';
import { DaoUpdateDto, ProposalUpdateDto } from '@sputnik-v2/event';
import { buildNotificationId } from '@sputnik-v2/utils';
import { NotificationType } from '@sputnik-v2/notification';

export function castDaoUpdateNotification(
  data: DaoUpdateDto,
  type: NotificationType,
): NotificationDto {
  return {
    id: buildNotificationId(type, String(data.txAction.transactionHash)),
    daoId: data.dao.id,
    targetId: data.dao.id,
    type: type,
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
  type: NotificationType,
): NotificationDto {
  return {
    id: buildNotificationId(type, String(data.txAction.transactionHash)),
    daoId: data.proposal.daoId,
    targetId: data.proposal.id,
    signerId: data.txAction.signerId,
    type: type,
    metadata: {
      methodName: data.txAction.methodName,
      args: data.txAction.args,
    },
    timestamp: data.txAction.timestamp,
  };
}
