import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DaoResponseV1 } from '@sputnik-v2/dao';
import { AxiosResponse } from 'axios';

@Injectable()
export class DaoApiService {
  private readonly apiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = configService.get('dao_api').apiUrl;
  }

  async getDao(id: string): Promise<AxiosResponse<DaoResponseV1>> {
    return this.httpService.axiosRef.get<DaoResponseV1>(
      `${this.apiUrl}/api/v1/daos/${id}`,
    );
  }
}
