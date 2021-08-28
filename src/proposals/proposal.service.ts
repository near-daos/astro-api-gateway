import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dao } from 'src/daos/entities/dao.entity';
import { buildProposalId, convertDuration } from 'src/utils';
import { Like, Repository } from 'typeorm';
import { ProposalDto } from './dto/proposal.dto';
import { Proposal, ProposalKind } from './entities/proposal.entity';
import camelcaseKeys from 'camelcase-keys';
import { SearchQuery } from 'src/common';
import { ProposalQuery } from './dto/proposal-query.dto';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
  ) {}

  create(proposalDto: ProposalDto): Promise<Proposal> {
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
      votes,
      transactionHash,
      updateTransactionHash,
      createTimestamp,
      updateTimestamp,
    } = proposalDto;

    const proposalId = buildProposalId(daoId, id);
    const proposal = new Proposal();

    proposal.id = proposalId;
    proposal.proposalId = id;

    proposal.daoId = daoId;
    const dao = { id: daoId } as Dao;
    proposal.dao = dao;

    proposal.description = description;
    proposal.proposer = proposer;
    proposal.target = target;
    proposal.status = status;
    proposal.voteNo = vote_no;
    proposal.voteYes = vote_yes;
    proposal.votePeriodEnd = convertDuration(vote_period_end);
    proposal.kind = camelcaseKeys(kind, { deep: true }) as ProposalKind;
    proposal.votes = votes;
    proposal.transactionHash = transactionHash;
    proposal.updateTransactionHash = updateTransactionHash;
    proposal.createTimestamp = createTimestamp;
    proposal.updateTimestamp = updateTimestamp;

    return this.proposalRepository.save(proposal);
  }

  async find({
    daoId,
    offset,
    limit,
    order,
  }: ProposalQuery): Promise<Proposal[]> {
    return this.proposalRepository.find({
      skip: offset,
      take: limit,
      where: {
        dao: {
          id: daoId,
        },
      },
      order,
    });
  }

  findOne(id: string): Promise<Proposal> {
    return this.proposalRepository.findOne(id);
  }

  async findByQuery({
    query,
    offset,
    limit,
    order,
  }: SearchQuery): Promise<Proposal[]> {
    return this.proposalRepository.find({
      skip: offset,
      take: limit,
      where: [
        { id: Like(`%${query}%`) },
        { target: Like(`%${query}%`) },
        { proposer: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
        { votes: Like(`%${query}%`) },
      ],
      order,
    });
  }
}
