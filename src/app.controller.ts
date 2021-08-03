import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor() { }

  @ApiExcludeEndpoint()
  @Get()
  main(): string {
    return 'Sputnik v1 API v1.0';
  }
}
