import { Contract } from 'near-api-js/lib/contract';

export interface SputnikDaoVersion {
  version: number[];
  commit_id: string;
  changelog_url: string | null;
}

export declare class SputnikDaoFactoryContract extends Contract {
  get_dao_list(): Promise<string[]>;
  get_number_daos(): Promise<number>;
  get_daos(params: { from_index: number; limit: number }): Promise<string[]>;
  get_contracts_metadata(): Promise<[string, SputnikDaoVersion][]>;
}
