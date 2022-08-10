import { Logger } from '@nestjs/common';
import StatsD from 'hot-shots';

export class StatsDService {
  private readonly logger = new Logger(StatsDService.name);

  constructor(
    public readonly client = new StatsD({
      prefix: `${process.env.DD_SERVICE}.`,
      errorHandler: (error) => {
        this.logger.error(error);
      },
    }),
  ) {}
}
