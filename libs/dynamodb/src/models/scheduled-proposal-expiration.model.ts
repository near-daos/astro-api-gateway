import { BaseModel } from '../models';

export class ScheduledProposalExpirationEvent extends BaseModel {
  ttl: number;
  proposalId: number;
}
