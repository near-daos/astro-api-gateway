import { Injectable } from '@nestjs/common';
import {
  ProposalStatus,
  ProposalType,
  ProposalVariant,
} from '@sputnik-v2/proposal/types';
import { DaoUpdateDto, ProposalUpdateDto } from '@sputnik-v2/event';
import {
  Notification,
  NotificationService,
  NotificationType,
} from '@sputnik-v2/notification';
import { DaoService, DaoVariant } from '@sputnik-v2/dao';
import { ProposalService } from '@sputnik-v2/proposal';

import {
  castDaoUpdateNotification,
  castProposalUpdateNotification,
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
    const notificationType = this.getDaoUpdateNotificationType(data);
    return notificationType
      ? this.notificationService.create(
          castDaoUpdateNotification(data, notificationType),
        )
      : null;
  }

  async handleProposalUpdateNotification(
    data: ProposalUpdateDto,
  ): Promise<Notification | null> {
    const notificationType = this.getProposalUpdateNotificationType(data);
    return notificationType
      ? this.notificationService.create(
          castProposalUpdateNotification(data, notificationType),
        )
      : null;
  }

  private getDaoUpdateNotificationType(
    data: DaoUpdateDto,
  ): NotificationType | null {
    if (data.txAction.methodName === 'create') {
      const daoVariant = this.daoService.getDaoVariant(data.dao);

      switch (daoVariant) {
        case DaoVariant.Club:
          return NotificationType.ClubDaoCreation;
        case DaoVariant.Foundation:
          return NotificationType.FoundationDaoCreation;
        case DaoVariant.Corporation:
          return NotificationType.CorporationDaoCreation;
        case DaoVariant.Cooperative:
          return NotificationType.CooperativeDaoCreation;
        case DaoVariant.Custom:
          return NotificationType.CustomDaoCreation;
      }
    }
    return null;
  }

  private getProposalUpdateNotificationType(
    data: ProposalUpdateDto,
  ): NotificationType | null {
    // Create Proposal
    if (data.txAction.methodName === 'add_proposal') {
      switch (data.proposal.type) {
        case ProposalType.Transfer:
          return NotificationType.TransferProposalCreation;

        case ProposalType.AddBounty:
          return NotificationType.BountyProposalCreation;

        case ProposalType.BountyDone:
          return NotificationType.BountyDoneProposalCreation;

        case ProposalType.Vote:
          return NotificationType.PollProposalCreation;
      }
    }

    // Approve Proposal
    if (
      data.txAction.methodName === 'act_proposal' &&
      data.proposal.status === ProposalStatus.Approved
    ) {
      const proposalVariant = this.proposalService.getProposalVariant(
        data.proposal,
      );

      switch (proposalVariant) {
        case ProposalVariant.ProposeChangeDaoName:
          return NotificationType.DaoNameUpdated;

        case ProposalVariant.ProposeChangeDaoPurpose:
          return NotificationType.DaoPurposeUpdated;

        case ProposalVariant.ProposeChangeDaoLinks:
          return NotificationType.DaoLinksUpdated;

        case ProposalVariant.ProposeChangeDaoLegalInfo:
          return NotificationType.DaoLegalUpdated;

        case ProposalVariant.ProposeChangeDaoFlag:
          return NotificationType.DaoFlagUpdated;

        case ProposalVariant.ProposeChangeBonds:
          return NotificationType.DaoDeadlinesUpdated;

        case ProposalVariant.ProposeChangeVotingPolicy:
          return NotificationType.DaoRulesUpdated;

        case ProposalVariant.ProposeCreateGroup:
          return NotificationType.DaoGroupAdded;

        case ProposalVariant.ProposeAddMember:
          return NotificationType.DaoMembersAdded;

        case ProposalVariant.ProposeRemoveMember:
          return NotificationType.DaoMemberRemoved;
      }
    }

    return null;
  }
}
