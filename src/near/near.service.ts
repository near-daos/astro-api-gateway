import {
    connect,
    Contract,
    Near
} from 'near-api-js';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NearService {
    private factoryContract!: Contract & any;

    private near!: Near;

    constructor(private readonly configService: ConfigService) {}

    //TODO: move to async useFactory provider!!!
    public async init(): Promise<void> {
        this.near = await connect({
            deps: { keyStore: new InMemoryKeyStore() },
            ...this.configService.get('near'),
        });

        const account = await this.near.account('sputnik');

        this.factoryContract = new Contract(account, this.configService.get('near').contractName, {
            viewMethods: ['get_dao_list'],
            changeMethods: ['create'],
        });
    }

    public async getDaoList(): Promise<any[]> {
        return await this.factoryContract.get_dao_list();
    }
}
