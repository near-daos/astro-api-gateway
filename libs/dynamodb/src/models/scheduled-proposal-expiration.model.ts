import { BaseModel } from '@sputnik-v2/dynamodb';

export class ScheduledProposalExpirationEvent extends BaseModel {
  ttl: number;
  proposalId: number;
}
