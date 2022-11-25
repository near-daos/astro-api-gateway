import { Contract } from 'near-api-js/lib/contract';

// TODO add return types
export declare class NearSputnikDaoFactoryContract extends Contract {
  get_dao_list(): Promise<string[]>;
  get_number_daos(): Promise<number>;
  get_daos(): Promise<Array<any>>;
  tx_status(): Promise<any>;
  get_contracts_metadata(): Promise<any>;
}

// TODO add return types
export declare class NearSputnikDaoContract extends Contract {
  get_config(): Promise<any>;
  get_policy(): Promise<any>;
  get_staking_contract(): Promise<any>;
  get_available_amount(): Promise<any>;
  delegation_total_supply(): Promise<any>;
  get_last_proposal_id(): Promise<number>;
  get_proposals(params: {
    from_index: number;
    limit: number;
  }): Promise<Array<any>>;
  get_proposal(params: { id: number }): Promise<any>;
  get_last_bounty_id(): Promise<number>;
  get_bounties(params: {
    from_index: number;
    limit: number;
  }): Promise<Array<any>>;
  get_bounty(params: { id: number }): Promise<any>;
  get_bounty_claims(params: { account_id: string }): Promise<Array<any>>;
  get_bounty_number_of_claims(params: any): Promise<number>;
  delegation_balance_of(params: { account_id: string }): Promise<any>;
  add_proposal(): Promise<any>;
  act_proposal(): Promise<any>;
}

// TODO add return types
export declare class NearStakingContract extends Contract {
  ft_total_supply(): Promise<any>;
  ft_balance_of(): Promise<any>;
  get_user(params: { account_id: string }): Promise<any>;
  delegate(): Promise<any>;
  undelegate(): Promise<any>;
  withdraw(): Promise<any>;
}

// TODO add return types
export declare class NearFTokenContract extends Contract {
  ft_balance_of(params: { account_id: string }): Promise<any>;
  ft_metadata(): Promise<any>;
  ft_total_supply(): Promise<any>;
}

// TODO add return types
export declare class NearNfTokenContract extends Contract {
  nft_tokens_for_owner(params: {
    account_id: string;
    from_index: string;
    limit: number;
  }): Promise<any>;
  nft_metadata(): Promise<any>;
  nft_total_supply(): Promise<any>;
}

// TODO add return types
export declare class NearTokenFactoryContract extends Contract {
  get_required_deposit(): Promise<any>;
  get_number_of_tokens(): Promise<any>;
  get_tokens(): Promise<any>;
  get_token(): Promise<any>;
  create_token(): Promise<any>;
  storage_deposit(): Promise<any>;
}
