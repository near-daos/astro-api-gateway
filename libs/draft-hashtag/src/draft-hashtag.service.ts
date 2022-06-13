import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import {
  BaseResponseDto,
  DRAFT_DB_CONNECTION,
  Order,
  SearchDto,
} from '@sputnik-v2/common';
import { DraftHashtag } from './entities';

@Injectable()
export class DraftHashtagService {
  constructor(
    @InjectRepository(DraftHashtag, DRAFT_DB_CONNECTION)
    private draftHashtagRepository: MongoRepository<DraftHashtag>,
  ) {}

  async createMultiple(hashtags: string[]) {
    const draftHashtags = await this.draftHashtagRepository.find({
      where: { value: { $in: hashtags } },
    });
    const foundHashtags = draftHashtags.map(({ value }) => value);

    await this.draftHashtagRepository.save(
      hashtags
        .filter((tag) => !foundHashtags.includes(tag))
        .map((value) => ({ value })),
    );
  }

  async getAll(params: SearchDto): Promise<BaseResponseDto<DraftHashtag>> {
    const {
      limit = 10,
      offset = 0,
      search,
      orderBy = 'createdAt',
      order = Order.DESC,
    } = params;
    const queries = [];

    if (search) {
      const searchRegExp = new RegExp(search.trim(), 'i');
      queries.push({ value: { $regex: searchRegExp } });
    }

    const [data, total] = await this.draftHashtagRepository.findAndCount({
      where: queries.length ? { $and: queries } : {},
      order: { [orderBy]: order },
      take: limit,
      skip: offset,
    });

    return {
      limit,
      offset,
      total,
      data,
    };
  }
}
