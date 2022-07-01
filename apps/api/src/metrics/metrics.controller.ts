import { Controller, Get } from '@nestjs/common';
import { Span } from 'nestjs-ddtrace';

import { MetricsService } from './metrics.service';

@Span()
@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  public metrics(): Promise<string> {
    return this.metricsService.metrics;
  }
}
