import { Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import {
  CrudRequest,
  CrudRequestInterceptor,
  JoinOptions,
  MergedCrudOptions,
} from '@nestjsx/crud';
import { RequestQueryParser } from '@nestjsx/crud-request';

@Injectable()
export class BaseCrudRequestInterceptor extends CrudRequestInterceptor {
  getCrudRequest(
    parser: RequestQueryParser,
    crudOptions: Partial<MergedCrudOptions>,
    requiredFields?: string[],
  ): CrudRequest {
    const crudRequest = super.getCrudRequest(parser, crudOptions);

    const { sort, offset, limit, page, fields } = crudRequest?.parsed || {};

    if (page < 0) {
      throw new QueryFailedError(
        '',
        undefined,
        new Error('PAGE must not be negative'),
      );
    }

    if (requiredFields && fields?.length) {
      requiredFields.forEach((field) => {
        if (!fields.includes(field)) {
          throw new QueryFailedError(
            '',
            undefined,
            new Error(`${field} field is required`),
          );
        }
      });
    }

    if (!sort || !sort.length) {
      crudRequest.parsed.sort = [{ field: 'createdAt', order: 'DESC' }];
    }

    crudRequest.parsed.offset = offset || 0;
    crudRequest.parsed.limit = limit || 50;

    return crudRequest;
  }

  parsedJoinToOptions(crudRequest: CrudRequest): JoinOptions {
    return crudRequest.parsed.join.reduce(function (acc, { field, select }) {
      acc[field] = { eager: true, select };
      return acc;
    }, {});
  }
}
