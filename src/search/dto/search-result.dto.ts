import { Dao } from "src/daos/entities/dao.entity";
import { Proposal } from "src/proposals/entities/proposal.entity";

export class SearchResultDto {
  daos: Dao[];
  proposals: Proposal[]
}
