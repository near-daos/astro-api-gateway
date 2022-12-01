import { VotePolicy } from './vote-policy';
import { RoleKindType } from '../entities';

export class RolePermission {
  name: string;
  kind: RoleKindType;
  balance?: number;
  accountIds?: string[];
  permissions: string[];
  votePolicy: { [key: string]: VotePolicy };
}
