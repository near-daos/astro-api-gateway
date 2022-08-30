import { Span } from 'nestjs-ddtrace';

import { Controller, Get, Logger } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Span()
@Controller()
export class ServiceController {
  private readonly logger = new Logger(ServiceController.name);

  constructor() {}

  @ApiExcludeEndpoint()
  @Get()
  main(): string {
    return 'Astro Account Service API v1.0';
  }
}
