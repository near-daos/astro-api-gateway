import { BaseEntity } from './base-entity';

export type PartialEntity<M> = Partial<M> & BaseEntity;
