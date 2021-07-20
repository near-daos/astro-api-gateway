import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dao } from 'src/daos/entities/dao.entity';
import { buildProposalId, convertDuration } from 'src/utils';
import { Repository } from 'typeorm';
import { CreateProposalDto } from './dto/proposal.dto';
import { Proposal, ProposalKind } from './entities/proposal.entity';
import camelcaseKeys from 'camelcase-keys';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
  ) { }

  create(proposalDto: CreateProposalDto): Promise<Proposal> {
    const {
      id,
      daoId,
      description,
      kind,
      proposer,
      target,
      status,
      vote_no,
      vote_yes,
      vote_period_end,
      votes
    } = proposalDto;

    const proposalId = buildProposalId(daoId, id);
    const proposal = new Proposal();

    proposal.id = proposalId;
    const dao = { id: daoId } as Dao;
    proposal.dao = dao;

    proposal.description = description;
    proposal.proposer = proposer;
    proposal.target = target;
    proposal.status = status;
    proposal.voteNo = vote_no;
    proposal.voteYes = vote_yes;
    proposal.votePeriodEnd = convertDuration(vote_period_end);
    proposal.kind = camelcaseKeys(kind, { deep: true } ) as ProposalKind;
    proposal.votes = votes;

    return this.proposalRepository.save(proposal);
  }

  async findAll(): Promise<Proposal[]> {
    return this.proposalRepository.find();
  }

  findOne(id: string): Promise<Proposal> {
    return this.proposalRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.proposalRepository.delete(id);
  }
}