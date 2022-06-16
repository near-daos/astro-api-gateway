import { Repository } from 'typeorm';
import hash from 'object-hash';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SharedProposalTemplate } from '@sputnik-v2/proposal-template/entities';
import { CreateSharedProposalTemplateDto } from '@sputnik-v2/proposal-template/dto';

import { SharedProposalTemplateDao } from './entities/shared-proposal-template-dao.entity';

@Injectable()
export class SharedProposalTemplateService extends TypeOrmCrudService<SharedProposalTemplate> {
  private readonly logger = new Logger(SharedProposalTemplateService.name);

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(SharedProposalTemplate)
    private readonly sharedProposalTemplateRepository: Repository<SharedProposalTemplate>,

    @InjectRepository(SharedProposalTemplateDao)
    private readonly sharedProposalTemplateDaoRepository: Repository<SharedProposalTemplateDao>,
  ) {
    super(sharedProposalTemplateRepository);
  }

  async create(
    createProposalTemplate: CreateSharedProposalTemplateDto,
  ): Promise<Partial<SharedProposalTemplate>> {
    const { daoId, config } = createProposalTemplate;
    const { smartContractAddress, methodName } = config;
    const { contractName } = this.configService.get('near');

    const id = hash(
      smartContractAddress.endsWith(contractName)
        ? { methodName }
        : { smartContractAddress, methodName },
    );

    const existingTemplate =
      await this.sharedProposalTemplateRepository.findOne({
        where: { id },
        select: ['id'],
        loadEagerRelations: false,
      });

    if (existingTemplate) {
      this.logger.log(
        `Shared Proposal Template already exists: ${id}. Skipping.`,
      );

      return existingTemplate;
    }

    this.logger.log(`Creating Shared Proposal Template: ${id}`);

    const template = await this.sharedProposalTemplateRepository.save({
      ...createProposalTemplate,
      id,
      daoCount: 1,
    });

    await this.sharedProposalTemplateDaoRepository.save({
      proposalTemplateId: id,
      daoId,
    });

    return template;
  }

  async cloneToDao(
    proposalTemplateId: string,
    daoId: string,
  ): Promise<SharedProposalTemplateDao> {
    const sharedProposalTemplateDao =
      await this.sharedProposalTemplateDaoRepository.save({
        proposalTemplateId,
        daoId,
      });

    const daoCount = await this.sharedProposalTemplateDaoRepository.count({
      where: { proposalTemplateId },
    });

    this.logger.log(
      `Cloning Shared Proposal Template ${proposalTemplateId} to DAO ${daoId}`,
    );

    await this.sharedProposalTemplateRepository.update(
      { id: proposalTemplateId },
      { daoCount },
    );

    return sharedProposalTemplateDao;
  }
}
