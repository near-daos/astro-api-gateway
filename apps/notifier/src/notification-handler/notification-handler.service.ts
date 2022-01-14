import { Injectable } from '@nestjs/common';
import { ProposalStatus, ProposalType } from '@sputnik-v2/proposal/types';
import { DaoUpdateDto, ProposalUpdateDto } from '@sputnik-v2/event';
import {
  Notification,
  NotificationService,
  NotificationStatus,
  NotificationType,
} from '@sputnik-v2/notification';
import { DaoService, DaoVariant } from '@sputnik-v2/dao';
import { ProposalService, Action } from '@sputnik-v2/proposal';

import {
  castDaoUpdateNotification,
  castProposalUpdateNotification,
  NotificationAction,
} from './types/notification';

@Injectable()
export class NotificationHandlerService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly proposalService: ProposalService,
    private readonly daoService: DaoService,
  ) {}

  async handleDaoUpdateNotification(
    data: DaoUpdateDto,
  ): Promise<Notification | null> {
    const notificationAction = this.getDaoUpdateNotificationAction(data);
    return notificationAction
      ? this.notificationService.create(
          castDaoUpdateNotification(data, notificationAction),
        )
      : null;
  }

  async handleProposalUpdateNotification(
    data: ProposalUpdateDto,
  ): Promise<Notification | null> {
    const notificationAction = this.getProposalUpdateNotificationAction(data);
    return notificationAction
      ? this.notificationService.create(
          castProposalUpdateNotification(data, notificationAction),
        )
      : null;
  }

  private getDaoUpdateNotificationAction(
    data: DaoUpdateDto,
  ): NotificationAction | null {
    if (data.txAction.methodName === 'create') {
      const daoVariant = this.daoService.getDaoVariant(data.dao);

      switch (daoVariant) {
        case DaoVariant.Club:
          return {
            type: NotificationType.ClubDao,
            status: NotificationStatus.Created,
          };
        case DaoVariant.Foundation:
          return {
            type: NotificationType.FoundationDao,
            status: NotificationStatus.Created,
          };
        case DaoVariant.Corporation:
          return {
            type: NotificationType.CorporationDao,
            status: NotificationStatus.Created,
          };
        case DaoVariant.Cooperative:
          return {
            type: NotificationType.CooperativeDao,
            status: NotificationStatus.Created,
          };
        default:
          return {
            type: NotificationType.CustomDao,
            status: NotificationStatus.Created,
          };
      }
    }
    return null;
  }

  private getProposalUpdateNotificationAction(
    data: ProposalUpdateDto,
  ): NotificationAction | null {
    const type = this.getProposalUpdateNotificationType(data);

    if (!type) {
      return null;
    }

    // Create Proposal
    if (data.txAction.methodName === 'add_proposal') {
      return {
        type,
        status: NotificationStatus.Created,
      };
    }

    // Vote Proposal
    if (
      data.txAction.methodName === 'act_proposal' &&
      data.proposal.status === ProposalStatus.InProgress
    ) {
      switch (data.txAction.args.action) {
        case Action.VoteApprove:
          return {
            type,
            status: NotificationStatus.VoteApprove,
          };
        case Action.VoteReject:
          return {
            type,
            status: NotificationStatus.VoteReject,
          };
        case Action.VoteRemove:
          return {
            type,
            status: NotificationStatus.VoteRemove,
          };
      }
    }

    // Approved Proposal
    if (
      data.txAction.methodName === 'act_proposal' &&
      data.proposal.status === ProposalStatus.Approved
    ) {
      return {
        type,
        status: NotificationStatus.Approved,
      };
    }

    // Rejected Proposal
    if (
      data.txAction.methodName === 'act_proposal' &&
      data.proposal.status === ProposalStatus.Rejected
    ) {
      return {
        type,
        status: NotificationStatus.Rejected,
      };
    }

    // Removed Proposal
    if (
      data.txAction.methodName === 'act_proposal' &&
      data.proposal.status === ProposalStatus.Removed
    ) {
      return {
        type,
        status: NotificationStatus.Removed,
      };
    }

    return null;
  }

  private getProposalUpdateNotificationType(
    data: ProposalUpdateDto,
  ): NotificationType | null {
    switch (data.proposal.kind?.kind.type) {
      case ProposalType.AddMemberToRole:
        return NotificationType.AddMemberToRole;

      case ProposalType.RemoveMemberFromRole:
        return NotificationType.RemoveMemberFromRole;

      case ProposalType.FunctionCall:
        return NotificationType.FunctionCall;

      case ProposalType.Transfer:
        return NotificationType.Transfer;

      case ProposalType.ChangePolicy:
        return NotificationType.ChangePolicy;

      case ProposalType.ChangeConfig:
        return NotificationType.ChangeConfig;

      case ProposalType.AddBounty:
        return NotificationType.AddBounty;

      case ProposalType.BountyDone:
        return NotificationType.BountyDone;

      case ProposalType.Vote:
        return NotificationType.Vote;
    }

    return null;
  }
}
