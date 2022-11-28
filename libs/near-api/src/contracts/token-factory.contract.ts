import { Contract } from 'near-api-js/lib/contract';

// TODO add return types
export declare class TokenFactoryContract extends Contract {
  get_required_deposit(): Promise<string>;
  get_number_of_tokens(): Promise<number>;
  get_tokens(): Promise<Array<any>>;
  get_token(): Promise<any>;
  create_token(): Promise<any>;
  storage_deposit(): Promise<any>;
}
