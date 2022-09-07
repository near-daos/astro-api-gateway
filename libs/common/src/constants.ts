export const NEAR_INDEXER_DB_CONNECTION = 'near_indexer';
export const DRAFT_DB_CONNECTION = 'draft';
export const NEST_APP_AGGREGATOR = 'aggregator';
export const NEST_APP_NOTIFIER = 'notifier';
export const NEST_APP_API = 'api';

export const NEAR_PROVIDER = 'NEAR_PROVIDER';
export const NEAR_SPUTNIK_PROVIDER = 'NEAR_SPUTNIK_PROVIDER';
export const NEAR_TOKEN_FACTORY_PROVIDER = 'NEAR_TOKEN_FACTORY_PROVIDER';
export const NEAR_API_PROVIDER = 'NEAR_API_PROVIDER';

export const EVENT_NOTIFICATION_SERVICE = 'EVENT_NOTIFICATION_SERVICE';
export const EVENT_NOTIFICATIONS_QUEUE_NAME = 'sputnik-events-notifications';
export const EVENT_DAO_UPDATE_NOTIFICATION = 'sputnik_dao_update_notification';
export const EVENT_PROPOSAL_UPDATE_NOTIFICATION =
  'sputnik_proposal_update_notification';
export const EVENT_NEW_NOTIFICATION = 'sputnik_dao_new_notification';
export const EVENT_NEW_COMMENT = 'sputnik_dao_new_comment';
export const EVENT_DELETE_COMMENT = 'sputnik_dao_delete_comment';
export const EVENT_TRIGGER_DAO_AGGREGATION = 'sputnik_dao_trigger_aggregation';

export const EVENT_API_SERVICE = 'EVENT_API_SERVICE';
export const EVENT_API_QUEUE_NAME = 'sputnik-events-api';

export const EVENT_DRAFT_SERVICE = 'EVENT_DRAFT_SERVICE';
export const EVENT_DRAFT_QUEUE_NAME = 'sputnik-events-draft';
export const EVENT_DRAFT_NEW_COMMENT = 'sputnik_dao_draft_new_comment';
export const EVENT_DRAFT_UPDATE_COMMENT = 'sputnik_dao_draft_update_comment';
export const EVENT_DRAFT_DELETE_COMMENT = 'sputnik_dao_draft_delete_comment';
export const EVENT_DRAFT_PROPOSAL_CLOSE = 'sputnik_dao_draft_proposal_close';

export const EVENT_AGGREGATOR_SERVICE = 'EVENT_AGGREGATOR_SERVICE';
export const EVENT_AGGREGATOR_QUEUE_NAME = 'sputnik-events-aggregator';

export const AGGREGATOR_HANDLER_STATE_ID = 'aggregator';
export const INDEXER_PROCESSOR_HANDLER_STATE_ID = 'indexer-processor';

export const DB_FOREIGN_KEY_VIOLATION = '23503';

export const PROPOSAL_DESC_SEPARATOR = '$$$$';

export const COMMENT_DELETE_VOTES_REQUIRED = 3;

export const OTP_TTL = 900000; // 15 minutes
