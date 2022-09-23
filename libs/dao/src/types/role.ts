import { VotePolicy } from './vote-policy';
import { RoleKindType } from '../entities';

export class RolePermission {
  id: string;
  name: string;
  kind: RoleKindType;
  balance: number;
  accountIds: string[];
  permissions: string[];
  votePolicy: { [key: string]: VotePolicy };
}
