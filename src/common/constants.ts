export const NEAR_INDEXER_DB_CONNECTION = 'near_indexer';
export const NEST_APP_AGGREGATOR = 'aggregator';
export const NEST_APP_NOTIFIER = 'notifier';
export const NEST_APP_API = 'api';

export const NEAR_PROVIDER = 'NEAR_PROVIDER';
export const NEAR_SPUTNIK_PROVIDER = 'NEAR_SPUTNIK_PROVIDER';
export const NEAR_TOKEN_FACTORY_PROVIDER = 'NEAR_TOKEN_FACTORY_PROVIDER';

export const EVENT_NOTIFICATION_SERVICE = 'EVENT_NOTIFICATION_SERVICE';
export const EVENT_NOTIFICATIONS_QUEUE_NAME = 'sputnik-events-notifications';
export const EVENT_DAO_UPDATE_MESSAGE_PATTERN = 'sputnik_dao_update_event';

export const EVENT_API_SERVICE = 'EVENT_API_SERVICE';
export const EVENT_API_QUEUE_NAME = 'sputnik-events-api';

export const DB_FOREIGN_KEY_VIOLATION = '23503';

// Clean pending DAOs after a week of inactivity
export const DAO_PENDING_CLEAN_THRESHOLD_IN_MILLIS = 7 * 24 * 60 * 60 * 1000; 
