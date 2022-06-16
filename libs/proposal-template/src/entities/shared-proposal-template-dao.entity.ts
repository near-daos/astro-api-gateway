import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'shared_proposal_template_dao', synchronize: false })
export class SharedProposalTemplateDao {
  @PrimaryColumn({ type: 'text', name: 'proposal_template_id' })
  proposalTemplateId: string;

  @PrimaryColumn({ type: 'text', name: 'dao_id' })
  daoId: string;
}
